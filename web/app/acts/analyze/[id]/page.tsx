"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Sparkles, Save, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Basic PDF Viewer using iframe
const PdfViewer = ({ url, refreshTrigger }: { url: string, refreshTrigger: number }) => {
    const [exists, setExists] = React.useState<boolean | null>(null)

    React.useEffect(() => {
        setExists(null) // Reset on trigger
        fetch(url, { method: 'HEAD' })
            .then(res => setExists(res.ok))
            .catch(() => setExists(false))
    }, [url, refreshTrigger])

    if (exists === null) return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="animate-pulse text-muted-foreground">Checking document availability...</span>
        </div>
    )

    if (!exists) {
        return (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center border rounded-lg p-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-semibold text-lg">Document Ready to Retrieve</h3>
                <p className="text-muted-foreground max-w-xs mt-2 text-sm">
                    The source PDF is available. Click <span className="font-semibold text-primary">AI Analyze</span> to fetch it from the government archives and generate insights.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center border rounded-lg overflow-hidden">
            <iframe
                src={url}
                className="w-full h-full"
                title="PDF Viewer"
            />
        </div>
    )
}

export default function AnalysisPage() {
    const params = useParams()
    const id = params.id as string

    // State
    const [apiKey, setApiKey] = React.useState("")
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [analysisData, setAnalysisData] = React.useState<any>(null)
    const [pdfRefresh, setPdfRefresh] = React.useState(0)

    // Load key from session storage on mount
    React.useEffect(() => {
        const storedKey = sessionStorage.getItem("gemini_api_key")
        if (storedKey) setApiKey(storedKey)
    }, [])

    // Save key to session storage when changed
    const handleKeyChange = (val: string) => {
        setApiKey(val)
        sessionStorage.setItem("gemini_api_key", val)
    }

    // Derived
    const hasKey = apiKey.length > 0

    // Handlers
    const handleAnalyze = async () => {
        if (!hasKey) {
            setIsSettingsOpen(true)
            return
        }

        setIsAnalyzing(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doc_id: id, api_key: apiKey })
            })

            const data = await res.json()
            if (res.ok) {
                // Refresh PDF view as it might have been downloaded
                setPdfRefresh(prev => prev + 1)

                // Set the raw rich data
                setAnalysisData(data)
            } else {
                console.error("Analysis failed:", data)
                alert("Analysis failed: " + (data.error || "Unknown error"))
            }

        } catch (e) {
            console.error(e)
            alert("Error connecting to analysis service")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSave = () => {
        if (!analysisData) return

        const fileName = `${id}-analysis-${new Date().toISOString().split('T')[0]}.json`
        const jsonStr = JSON.stringify(analysisData, null, 2)
        const blob = new Blob([jsonStr], { type: "application/json" })
        const href = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = href
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(href)
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="h-14 border-b px-4 flex items-center justify-between bg-background">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Analysis: {id}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Analysis Settings</SheetTitle>
                                <SheetDescription>
                                    Configure AI settings for this session. Keys are cleared on exit.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Gemini API Key</Label>
                                    <Input
                                        type="password"
                                        placeholder="sk-..."
                                        value={apiKey}
                                        onChange={e => handleKeyChange(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Required for "AI Analyze" feature.
                                    </p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="gap-2"
                        variant={hasKey ? "default" : "secondary"}
                    >
                        {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                        <Sparkles className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleSave}
                        disabled={!analysisData}
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                {/* Left: PDF Viewer */}
                <div className="p-4 border-r bg-muted/10 h-full overflow-hidden">
                    <PdfViewer url={`/pdfs/${id}.pdf`} refreshTrigger={pdfRefresh} />
                </div>

                {/* Right: Annotations / Assistant */}
                <div className="p-4 h-full overflow-y-auto bg-background">
                    <Card className="h-full border-none shadow-none flex flex-col">
                        <CardHeader className="px-0 pt-0 pb-4 border-b mb-4">
                            <CardTitle>Analysis Results</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 flex-1 overflow-y-auto space-y-6">
                            {!analysisData ? (
                                <div className="text-center text-muted-foreground py-10">
                                    No analysis data. Click "AI Analyze" to start.
                                </div>
                            ) : (
                                <>
                                    {/* Summary Section */}
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Summary</h3>
                                        <p className="text-sm leading-relaxed">{analysisData.summary || "No summary available."}</p>
                                    </div>

                                    <Separator />

                                    {/* Referenced Acts */}
                                    {analysisData.referenced_acts && analysisData.referenced_acts.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">References</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisData.referenced_acts.map((ref: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">{ref}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Amendments / Sections */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
                                            {analysisData.sections ? "Sections Detected" : "Amendments"}
                                        </h3>

                                        {/* Render Sections if available */}
                                        {analysisData.sections && analysisData.sections.map((sec: any, idx: number) => (
                                            <div key={idx} className="p-4 border rounded-lg bg-card space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline">Section {sec.section_number}</Badge>
                                                    {sec.footnotes && sec.footnotes.length > 0 && (
                                                        <Badge variant="destructive" className="text-[10px]">{sec.footnotes.length} Notes</Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-foreground/90 whitespace-pre-wrap">{sec.content}</div>

                                                {sec.footnotes && sec.footnotes.length > 0 && (
                                                    <div className="mt-3 bg-muted/30 p-2 rounded text-xs text-muted-foreground">
                                                        <strong>Notes:</strong>
                                                        <ul className="list-disc list-inside mt-1">
                                                            {sec.footnotes.map((note: string, ni: number) => (
                                                                <li key={ni}>{note}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Legacy Fallback for Amendments only */}
                                        {!analysisData.sections && analysisData.amended_sections && (
                                            <div className="space-y-2">
                                                {analysisData.amended_sections.map((sec: any, idx: number) => (
                                                    <div key={idx} className="p-3 border rounded">
                                                        <Badge>{analysisData.amendment_type}</Badge>
                                                        <p className="mt-1 text-sm">{sec}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
