# Sold Equipment — Auto-Approve Rules v1

Goal: replace EQUIP SOLD Zap supervisor + warehouse gates with smart automation.
Escalate only on mismatch / low stock. ~90% of sales should pass without Lonzo.

## Pipeline

1. **Ingest** sold estimate (ServiceTitan; drop Outlook 2-min poll when ST webhook/API is live)
2. **Accuracy score** (ops / supervisor gate)
3. **Stock check** (warehouse gate → CSR can schedule)
4. If both green → **auto-requisition** in ServiceTitan
5. Else → Slack `#d2d-ops` with the same parent-message UX (ops buttons and/or warehouse buttons)

## Ops auto-approve (accuracy)

### SAFE — auto-approve when ALL true
- Install type is **SC Ceiling** (or known condenser-only / wall pattern below)
- Sold SKUs exactly match a **canonical pair** for the tonnage on the estimate line:
  - 2T: `GLXS4BA2410A` + `24HXS05`
  - 2.5T: `GLXS4BA3010A` + `30HXS05`
  - 3T: `GLXS4BA3610A` + `36HXS05` (accept legacy `36HX5`)
- Property is a known high-volume complex with that pattern (Rise*, Clifford, Station 21, Cornerstone, IMT Ahwatukee, Ovation, Dana Park / Montero with matching tonnage, Desert Eagle, Biscayne, Talise, Sonoran, Residences, The Turn, The Core, etc.)
- Optional later: customer-profile note on the location lists the same family (R-32 GLX + HXS)

### Property-specific SAFE overrides
- **Rise Broadway / Rise condenser-only**: `GLXS4BA2410A` alone OK → auto-approve ops, but **queue A2L sensor add** (or escalate until sensor line present)
- **Park Mesa wall**: `A5AC4024` + `FMA5X2400AL`
- **Griffin wall**: `GLXS4BA2410A` + `AWST24SU1305`

### Do NOT escalate only because
- Job is `#N/A` (normal)

### ESCALATE to supervisor (Slack approve/decline)
- **Hue97** unless SKUs are preferred 454B `A5AC4030/36` + matching HXS (or explicit GLX fallback after stock note)
- **Indigo** / any `GLZS*` / HP Closet / multi-position AH
- Wall / Closet / HP / Misc install types not in SAFE overrides
- Tonnage on line item ≠ condenser tonnage encoded in SKU
- SKU set not in canonical table and not in property history this year
- Customer-profile note exists and **conflicts** with sold SKUs
- Prior decline / correction history on same estimate within 24h

### Confidence sources (priority)
1. Location customer-profile equipment notes (ServiceTitan)
2. Property → SKU frequency from `#d2d-ops` approvals (this year)
3. Global canonical pairs above

## Warehouse auto-approve (stock)

- For each sold equipment SKU, query ServiceTitan inventory/on-hand (and inbound PO if available)
- **Enough for all SKUs** → auto warehouse-approve (CSR can schedule)
- **Any SKU short** → Slack `@warehouse-team` Ready / Not Ready (current UX)
- Hue97 A5AC often special-order → prefer escalate warehouse even if ops auto-approved

## Auto-requisition

Fire only when:
- Ops gate = auto-approved (or human approved)
- Warehouse gate = auto-approved (or human Ready)
- Then create requisition in ServiceTitan (and keep Slack trail on the parent thread)

## Slack parent message (parity with today)

Keep one parent per sold estimate:
- Estimate / Job / price / SKUs
- Status chips: Ops (auto|pending|approved|declined), Warehouse (auto|pending|ready|short), Requisition (pending|done)
- Buttons only for gates that were not auto-cleared

## Out of scope for v1
- Crane / property access scheduling holds (still human in thread)
- Accidental decline recovery UX (nice-to-have)
- Full mobile app (PWA/web first)
