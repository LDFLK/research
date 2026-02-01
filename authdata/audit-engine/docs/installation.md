# Installation Guide

This guide covers the complete setup of the OpenGINXplore Tourism Audit Framework, including both the Python audit engine and the NextJS dashboard.

## Prerequisites

### System Requirements

| Component | Minimum Version | Purpose |
|-----------|----------------|---------|
| Python | 3.10+ | Audit engine runtime |
| Node.js | 18+ | Dashboard runtime |
| Chrome | Latest | Selenium browser automation |
| ChromeDriver | Matching Chrome | Selenium WebDriver |

### Verify Prerequisites

```bash
# Check Python version
python --version
# Should output: Python 3.10.x or higher

# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check Chrome version
google-chrome --version  # Linux
# or
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version  # macOS
```

## Installing ChromeDriver

ChromeDriver must match your Chrome browser version.

### macOS (using Homebrew)

```bash
# Install ChromeDriver
brew install chromedriver

# Allow ChromeDriver to run (first time only)
xattr -d com.apple.quarantine $(which chromedriver)

# Verify installation
chromedriver --version
```

### macOS (manual download)

```bash
# Check your Chrome version first
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version

# Download matching ChromeDriver from:
# https://googlechromelabs.github.io/chrome-for-testing/

# Extract and move to PATH
unzip chromedriver-mac-x64.zip
sudo mv chromedriver-mac-x64/chromedriver /usr/local/bin/
chmod +x /usr/local/bin/chromedriver
```

### Linux (Ubuntu/Debian)

```bash
# Install Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f

# Install ChromeDriver via apt
sudo apt-get install chromium-chromedriver

# Or download manually matching your Chrome version
# https://googlechromelabs.github.io/chrome-for-testing/
```

### Windows

1. Download Chrome from https://www.google.com/chrome/
2. Check Chrome version: Settings → About Chrome
3. Download matching ChromeDriver from https://googlechromelabs.github.io/chrome-for-testing/
4. Extract and add to PATH

## Installing the Audit Engine

### Step 1: Navigate to Project Directory

```bash
cd audit-engine
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Verify Installation

```bash
# Show help
python main.py --help

# List available commands
python main.py --version

# List configured datasets
python main.py list-datasets
```

### Dependencies

The `requirements.txt` includes:

```
click>=8.0.0          # CLI framework
requests>=2.28.0      # HTTP client
selenium>=4.15.0      # Browser automation
```

## Installing the Dashboard

### Step 1: Navigate to Dashboard Directory

```bash
cd ../audit-dashboard
```

### Step 2: Install Node Dependencies

```bash
npm install
```

### Step 3: Configure Dashboard

The dashboard reads audit results from `../audit-engine/audit-results/`. Verify the path in `lib/data.ts`:

```typescript
const AUDIT_RESULTS_DIR = path.join(process.cwd(), '..', 'audit-engine', 'audit-results');
```

### Step 4: Start Development Server

```bash
# Start on default port 3000
npm run dev

# Or specify a different port
npm run dev -- -p 3002
```

### Step 5: Open Dashboard

Open your browser to:
- http://localhost:3000 (default)
- http://localhost:3002 (if using alternate port)

## Directory Structure After Installation

```
openginxplore-audit/
├── audit-engine/
│   ├── venv/                    # Python virtual environment
│   ├── main.py                  # CLI entry point
│   ├── requirements.txt         # Python dependencies
│   ├── config/
│   │   └── datasets.json        # Dataset configurations
│   ├── core/                    # Core modules
│   ├── phases/                  # Audit phases
│   ├── workflows/               # Workflow orchestrators
│   ├── tools/                   # Utility tools
│   ├── audit-results/           # Generated outputs (created on first run)
│   └── docs/                    # Documentation
│
└── audit-dashboard/
    ├── node_modules/            # Node dependencies
    ├── package.json             # Node configuration
    ├── app/                     # NextJS pages
    ├── components/              # React components
    └── lib/                     # Utilities
```

## Running a Test Audit

Verify everything works by running a simple audit:

```bash
# Activate virtual environment (if not already active)
cd audit-engine
source venv/bin/activate

# Run audit for one dataset, one year
python main.py run -d "Top 10 Source Markets" -y 2023

# Expected output:
# Starting audit run: audit_20260131_HHMMSS
# Config: ./config/datasets.json
# ...
# Audit Complete!
# Run ID: audit_20260131_HHMMSS
# Total Actions: 16
# Successful: 16
# Failed: 0
# Datasets Passed: 2/2
```

View results in the dashboard:

```bash
# In another terminal
cd ../audit-dashboard
npm run dev -- -p 3002
# Open http://localhost:3002
```

## Troubleshooting

### ChromeDriver Version Mismatch

**Error:**
```
selenium.common.exceptions.SessionNotCreatedException: Message: session not created:
This version of ChromeDriver only supports Chrome version XX
```

**Solution:**
Download the correct ChromeDriver version matching your Chrome browser from https://googlechromelabs.github.io/chrome-for-testing/

### Chrome Not Found

**Error:**
```
selenium.common.exceptions.WebDriverException: Message: 'chromedriver' executable needs to be in PATH
```

**Solution:**
1. Verify ChromeDriver is installed: `which chromedriver`
2. Add to PATH if needed: `export PATH=$PATH:/path/to/chromedriver`

### Permission Denied (macOS)

**Error:**
```
"chromedriver" cannot be opened because the developer cannot be verified
```

**Solution:**
```bash
xattr -d com.apple.quarantine $(which chromedriver)
```

### Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'click'
```

**Solution:**
1. Ensure virtual environment is activated: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`

### Dashboard Not Finding Audit Results

**Error:**
Dashboard shows "No audit runs found"

**Solution:**
1. Verify audit-results directory exists: `ls audit-engine/audit-results/`
2. Run at least one audit first: `python main.py run`
3. Check path in `audit-dashboard/lib/data.ts`

### Connection Refused

**Error:**
```
requests.exceptions.ConnectionError: HTTPSConnectionPool
```

**Solution:**
1. Check internet connectivity
2. Verify the target URLs are accessible
3. Check for firewall/proxy issues

## Environment Variables (Optional)

You can configure behavior through environment variables:

```bash
# Set default config path
export AUDIT_CONFIG_PATH="./config/datasets.json"

# Set default output directory
export AUDIT_OUTPUT_DIR="./audit-results"

# Disable headless mode for debugging
export AUDIT_HEADLESS="false"
```

## Next Steps

After installation:

1. Read the [CLI Reference](./cli-reference.md) to learn all available commands
2. Review the [Configuration Guide](./configuration.md) to understand dataset setup
3. Explore the [Dashboard Guide](./dashboard.md) for visualization options
4. Check [Extending the Framework](./extending.md) to add custom datasets
