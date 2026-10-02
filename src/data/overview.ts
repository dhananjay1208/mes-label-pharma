import type { LearnBullet, TopicCard, StatTile } from './types';

export const HERO = {
  heading: 'Master MES-Labeling Integration',
  bodyLead: 'Explore how a modern MES drives barcode printers, coders and verifiers in ',
  bodyHighlight: 'Pharmaceutical (OSD) Manufacturing',
  bodyTail:
    ' at Helvion Pharma, Plant 2 Lakeworth. Learn through real ZPL print jobs, GS1-128 case and SSCC pallet label anatomy beside the FMD carton UI, a live ZPL playground, and a print-&-apply line simulation with verify-and-reconcile.',
};

export const LEARN_BULLETS_LEFT: LearnBullet[] = [
  {
    title: 'Where Every Mark Comes From',
    text: 'Carton UIs printed on the carton, anti-tamper seals applied, bundle / case / pallet labels printed, vignettes consumed — who prints what, from which data, at which machine',
  },
  {
    title: 'The Print-Apply-Verify Contract',
    text: 'Real ZPL over TCP 9100, printer status via ~HS/SGD, verifier grades and the void/reprint decision — field by field',
  },
  {
    title: 'ZPL & GS1 Hands-On',
    text: 'Edit live ZPL and watch the label change; merge MES batch data into a template; break the FNC1 and see exactly what a scanner loses',
  },
];

export const LEARN_BULLETS_RIGHT: LearnBullet[] = [
  {
    title: 'A Live Print-&-Apply Line',
    text: 'Watch PRN-CP1 tick by tick: ribbon-out, no-read reprints, a duplicate serial — and a stale template printing grade-A labels with last year\'s expiry',
  },
  {
    title: 'The Case Label That Lied',
    text: 'A five-step incident walkthrough: 240 shipped cases, every label grade A, every expiry wrong, a certified batch record — and the config that would have caught it',
  },
  {
    title: 'The Configuration Checklist',
    text: 'The eight label-integration configurations your plant needs: templates, pools, data mapping, serials, verify thresholds, label reconciliation',
  },
];

export const TOPIC_CARDS: TopicCard[] = [
  {
    title: 'The Marking Map',
    text: 'Six marking points from the serialization station to the palletizer — inkjet heads, print engines, applicators, cameras, scanners, and the marks that are materials',
  },
  {
    title: 'Print Job & Status Protocols',
    text: 'Raw ZPL over TCP 9100, stored formats, ~HS and SGD status, SNMP — and why "bytes accepted" never means "label applied"',
  },
  {
    title: 'GS1 Identifiers & Symbologies',
    text: 'GTIN, SSCC, Application Identifiers, FNC1, check digits — and why cartons use GS1 DataMatrix while cases use GS1-128',
  },
  {
    title: 'Label Software & Middleware',
    text: 'BarTender, NiceLabel/Loftware: template libraries, change control, printer pools, failover — and who owns the template',
  },
  {
    title: 'Verify & Reconcile',
    text: 'ISO 15416 grades, content verification, void/reprint policy, duplicate serials, label reconciliation — closing the loop back to the MES and the batch record',
  },
  {
    title: 'Required Configurations',
    text: 'The eight configurations every MES-labeling integration needs, as a checklist you can take back to your plant',
  },
];

export const STAT_TILES: StatTile[] = [
  { value: '8', label: 'Learning Sections', colorClass: 'text-leaf-700' },
  { value: '5', label: 'Message Exchanges', colorClass: 'text-tobacco-600' },
  { value: '1', label: 'Live ZPL Playground', colorClass: 'text-purple-600' },
  { value: '18', label: 'Digits in an SSCC', colorClass: 'text-orange-600' },
];
