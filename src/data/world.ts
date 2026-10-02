// The shared Helvion Pharma fictional world.
// Canonical IDs and numbers reused across the whole pharma training kit —
// keep consistent with Apps\PHARMA-MES-CONTEXT.md (the canon) and the
// sibling apps (mes-plc-pharma, mes-config-studio-pharma).
// Company, plant, products and people are fictional; standards and vendors are real.

export const WORLD = {
  company: 'Helvion Pharma',
  plantName: 'Plant 2 Lakeworth',
  plantCode: '2000',

  products: {
    flagship: 'CDX-10',        // Cardexil 10 mg film-coated tablet
    strength: 'CDX-20',        // Cardexil 20 mg
    export: 'CDX-10-EXP',      // Cardexil 10 mg EXPORT (Italian market, vignette)
    potent: 'ZTX-50',          // Zentrix 50 mg — segregated Line 5 only
    mini: 'FEM-2.5',           // Femodyl 2.5 mg mini-tablet
  },

  ids: {
    order: 'PO-77231',
    aufnr: '000004477231',
    apiLot: 'API-CDX-5512',
    granulationBatch: 'GB-1834',
    blendLot: 'BLND-1834',
    batch: 'B-CX-2417',
    pressRun: 'PR3-0724-A',
    coatingSuspension: 'CS-118',
    foilLot: 'FL-2216',
    cartonSerial: '4T7K9DQ2CX41',   // FMD serial (≤20 alnum) — from the L4 provider's allocated range
    expiry: '2028-06',
    expiryYYMMDD: '280630',          // AI (17) form of 2028-06 (last day of the month)
    bundleId: 'BN-2417-88',
    caseId: 'CS-2417-31',
    sscc: '003591230800127456',
    recipe: 'R-CDX-07 v12',
    qpCertificate: 'QP-2417',
  },

  equipment: {
    press: 'PR3',
    coater: 'CO1',
    blister: 'BL3',
    cartoner: 'CR3',
    bundler: 'BN3',
    casePacker: 'CP1',
    palletizer: 'PZ1',
    line: 'PLANT_2000_LINE_3',
  },

  // Level 2/1 landscape — machine codes & addresses (canon "Connectivity grammar").
  opc: {
    endpointPattern: 'opc.tcp://{code}-plc.hp2.local:4840',
    pr3: 'opc.tcp://pr3-plc.hp2.local:4840',
    bl3: 'opc.tcp://bl3-plc.hp2.local:4840',
    cr3: 'opc.tcp://cr3-plc.hp2.local:4840',
    nodeIdExample: 'ns=2;s=PR3.Prod.TabCount',
    checkweigher: 'Modbus TCP (checkweigher)',
    edgePackaging: 'EG-PKG-01',
    historian: 'HP2-HIST',
    serializationManager: 'HP2-SER',
  },

  // Canonical state words (frozen across packs)
  stateWords: [
    { word: 1, meaning: 'Running' },
    { word: 2, meaning: 'Starved' },
    { word: 3, meaning: 'Blocked' },
    { word: 4, meaning: 'Fault' },
    { word: 5, meaning: 'Changeover' },
    { word: 6, meaning: 'Idle' },
  ],

  faultCodes: {
    3104: 'Punch overload (PR3)',
    5203: 'Foil splice fault (BL3)',
    2205: 'UI printhead fault (CR3 serialization station)',
    4408: 'Leaflet missing (CR3)',
    // Labeling faults (canon "Labeling canon" block)
    6101: 'Ribbon out (PRN-CP1)',
    6102: 'Label media out (PRN-CP1)',
    6210: 'Verifier no-read → reprint (SCAN-CP1)',
    6220: 'Duplicate serial detected (reprint reconciliation)',
    6305: 'Stale template — grade A but WRONG content (PRN-CP1)',
  } as Record<number, string>,

  // -------------------------------------------------------------------------
  // Labeling canon (PHARMA-MES-CONTEXT.md "Labeling canon" — reused verbatim).
  // The carton UI (FMD DataMatrix) is NOT a label: it is printed on the carton
  // by the serialization station and camera-verified; its serials come ONLY
  // from the L4 serialization provider's allocated ranges. Bundle / case /
  // pallet labels ARE printed labels from MES via middleware, with ids the
  // MES generates under Helvion's GS1 company prefix.
  // -------------------------------------------------------------------------
  labels: {
    gs1CompanyPrefix: '0359123',
    // Full SSCC-18: ext 0 + prefix 0359123 + serial ref 080012745 + check 6.
    // mod-10, weights 3/1 from the right over the 17 payload digits 00359123080012745:
    //   weight-3 digits (5,7,1,0,0,2,9,3,0) sum 27 → ×3 = 81
    //   weight-1 digits (4,2,0,8,3,1,5,0)   sum 23
    //   81 + 23 = 104 → next multiple of 10 is 110 → check digit 6.
    ssccFull: '003591230800127456',
    ssccNote:
      'The pharma pack uses clean 18-digit SSCCs everywhere. A 15-character form (003591230800127) may appear only as a declared display truncation — never as a complete SSCC.',
    cartonGtin14: '00359123000108', // indicator 0 + prefix 0359123 + item ref 00010 + check 8  (3×14 + 10 = 52 → 8)
    caseGtin14: '20359123000317',   // indicator 2 + prefix 0359123 + item ref 00031 + check 7  (3×17 + 12 = 63 → 7)
    batch: 'B-CX-2417',
    expiryYYMMDD: '280630',
    caseElementString: '(01)20359123000317(17)280630(10)B-CX-2417(21)CS-2417-31',
    palletElementString: '(00)003591230800127456(02)20359123000317(37)48(10)B-CX-2417',
    cartonUiElementString: '(01)00359123000108(21)4T7K9DQ2CX41(10)B-CX-2417(17)280630',
    printers: [
      { id: 'PRN-CP1', desc: 'Case print & apply engine (Zebra ZE511, 300 dpi)', attachedTo: 'CP1', host: 'tcp://prn-cp1.hp2.local:9100' },
      { id: 'PRN-CP1B', desc: 'Case print & apply engine B — hot spare (Zebra ZE511, 300 dpi)', attachedTo: 'CP1', host: 'tcp://prn-cp1b.hp2.local:9100' },
      { id: 'PRN-PZ1', desc: 'Pallet SSCC printer (Zebra ZT411, 203 dpi)', attachedTo: 'PZ1', host: 'tcp://prn-pz1.hp2.local:9100' },
      { id: 'PRN-BN3', desc: 'Bundle label printer (Zebra ZD621 desktop, 203 dpi)', attachedTo: 'BN3', host: 'tcp://prn-bn3.hp2.local:9100' },
    ],
    pool: 'POOL-CASE',
    middleware: 'http://labelsvc.hp2.local:8080',
    serializationManager: 'HP2-SER',
    verifiers: {
      cartonStations: ['SER-CR3', 'SER-CR5'],   // serialization station: TIJ print + camera verify (canon SER-CR3, fault 2205)
      bundleScanner: 'SCAN-BN3',
      caseScanner: 'SCAN-CP1',                  // doubles as the case-label verifier
      palletScanner: 'SCAN-PZ1',
    },
    templates: {
      case: { id: 'LBL-CASE-STD', version: 14, staleVersion: 13, storedAs: 'E:LBLCASE.ZPL', crc: '0x5C3E91A7', staleCrc: '0x2B80D4F1' },
      pallet: { id: 'LBL-PLT-SSCC', version: 6, storedAs: 'E:LBLPLT.ZPL' },
      bundle: { id: 'LBL-BUNDLE', version: 3, storedAs: 'E:LBLBNDL.ZPL' },
    },
    materials: {
      caseLabels: 'LBL-CASE',
      palletLabels: 'LBL-PALLET',
      bundleLabels: 'LBL-BUNDLE',
      ribbon: 'RIB-WAX-RES',
      vignette: 'VIG-IT-CDX10',   // Italian bollino for CDX-10-EXP — lot-tracked, reconciled per shift
    },
    grading: {
      scaleNote: 'ISO/IEC 15416 — A 3.5–4.0 · B 2.5–3.49 · C 1.5–2.49 · D 0.5–1.49 · F <0.5',
      passMin: 1.5,   // pass ≥ C
      warnBelow: 2.5, // warn below B
      policy:
        'No-read or grade < C → auto-void + reprint. Content mismatch (decoded AIs ≠ MES-expected) → hard fail regardless of grade — under GMP a readable label with the wrong batch or expiry is a recall, not a warning.',
    },
  },

  numbers: {
    shiftMinutes: 480,
    pressRatedTpm: 4000,
    blisterRatedBpm: 400,
    cartonerRatedCpm: 200,
    tabletsPerBlister: 10,
    blistersPerCarton: 2,
    cartonsPerBundle: 10,
    bundlesPerCase: 20,
    cartonsPerCase: 200,
    tabletsPerCase: 4000,
    casesPerPallet: 48,
    casesPerBatch: 400,
    oeeBefore: 45.0,
    oeeAfter: 63.5,
    badMondayCost: '€1,283,000',
    goodMondayCost: '€21,400',
  },
} as const;
