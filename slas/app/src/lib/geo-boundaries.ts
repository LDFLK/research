import type { BoundaryMeta } from "./types";

let provincesCache: GeoJSON.FeatureCollection | null = null;
let districtsCache: GeoJSON.FeatureCollection | null = null;
let metaCache: BoundaryMeta | null = null;

export async function fetchProvinceBoundaries(): Promise<GeoJSON.FeatureCollection> {
  if (provincesCache) return provincesCache;
  const res = await fetch("/geo/provinces.geojson");
  if (!res.ok) throw new Error("Failed to load province boundaries");
  provincesCache = await res.json();
  return provincesCache!;
}

export async function fetchDistrictBoundaries(): Promise<GeoJSON.FeatureCollection> {
  if (districtsCache) return districtsCache;
  const res = await fetch("/geo/districts.geojson");
  if (!res.ok) throw new Error("Failed to load district boundaries");
  districtsCache = await res.json();
  return districtsCache!;
}

export async function fetchBoundaryMeta(): Promise<BoundaryMeta> {
  if (metaCache) return metaCache;
  const districts = await fetchDistrictBoundaries();
  const provinces = await fetchProvinceBoundaries();

  const provinceList = provinces.features.map((f) => ({
    code: f.properties!.code as string,
    name: f.properties!.name as string,
  }));

  const districtList = districts.features.map((f) => ({
    code: f.properties!.code as string,
    name: f.properties!.name as string,
    provinceCode: f.properties!.provinceCode as string,
  }));

  metaCache = { provinces: provinceList, districts: districtList };
  return metaCache;
}
