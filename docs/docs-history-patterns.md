# Sold Equipment History Patterns (Auto-Approval Intelligence)

**Source:** #d2d-ops (`C023D32SLLR`) — Equipment Sold AutoBot / EquipmentBot (`B0215U3N2TD`)  
**Sample window:** ~Mar–Sep 2026 (focus Aug–Sep for dense recent posts; declines sampled back to Apr)  
**Sample size:** ~40+ parent sold posts + decline/flagged threads  
**Approvers seen:** lonzo (`U022L2TQQE4`), Ish (`U0215LEMC9X`), Javier (`U07MWLQJAKE`, warehouse confirm), occasionally Josh / Manny  
**Report date:** 2026-09-02 PT

---

## 1. Bot flow (observed EQUIP SOLD / warehouse / requisition)

No dedicated Slack **canvas/SOP** titled “EQUIP SOLD” was found. Closest docs:

| Doc | ID | Relevance |
|-----|-----|-----------|
| Huddle notes 4/17/26 | `F0ATLLSQYF7` | Warehouse/requisition workflow: Liz should be able to modify/restart bad requisitions; Manny to train on workflow |
| Huddle notes 11/14/25 | `F09SXEZ6P37` | CSRs correcting equipment requisition errors; replenishment alerts |
| WARRANTIES CANVAS | `F09EHU006V9` | Warranties (not sold-equip flow) |

**Observed message lifecycle (from bot threads):**

1. **Parent post** — Estimate link, Job # or `#N/A`, line-item name/price, Equipment SKU links, Approve / Decline buttons.  
2. **Ops approve** (`:white_check_mark: Approved by: lonzo|Ish|…`) **or** decline (`:x: Declined by:`).  
3. If declined → bot: *“Please make changes and confirm. Only then requisition can be sent and job booked.”*  
4. After fix → *“Equipment has been corrected and verified, ready to sell, requisition and book”* **or** on clean approve → *“Equipment has been verified, ready to sell…”*  
5. Warehouse ping → `@warehouse-team Equipment Sold Approved Please locate and prepare:` (often **Approved by: Javier**).  
6. Next morning often → *“Equipment has been prepared by Warehouse and is ready to be fulfilled.”*

**Job `#N/A` is extremely common** and does **not** block human approve. Many clean 2T ceiling systems auto-ship with Job N/A.

---

## 2. Canonical SKU pairs (by install type / tonnage)

### Straight Cool (SC) — Ceiling AH (default high-volume path)

| Tonnage | Condenser | Ceiling AH | Typical line price (recent) | Notes |
|---------|-----------|------------|-----------------------------|-------|
| **2 Ton** | `GLXS4BA2410A` | `24HXS05` | $3,900–$4,100 | Dominant pattern; dozens of approvals |
| **2.5 Ton** | `GLXS4BA3010A` | `30HXS05` | $4,100–$4,300 | Cornerstone, Montero, Sonoran, Talise, San Riva, Village at Sun Valley |
| **3 Ton** | `GLXS4BA3610A` | `36HXS05` (also older `36HX5`) | $4,300–$4,500 | Desert Eagle, Biscayne Bay, Cambria; AH SKU migrated `36HX5` → `36HXS05` |

### Condenser-only (SC)

| Property pattern | SKU | Price | Notes |
|------------------|-----|-------|-------|
| **Rise Broadway** (frequent) | `GLXS4BA2410A` alone | ~$2,600–$3,295 | Condenser Install (SC). Thread flag: **needs A2L sensor** (Haley → Ish confirmed 2026-09-01) |
| **Rise Suncrest / Rise McClintock** | `GLXS4BA2410A` alone | varies | Condenser-only approvals |

### Wall AH (SC)

| Property | Condenser | Wall AH | Price | Notes |
|----------|-----------|---------|-------|-------|
| **Park Mesa** | `A5AC4024` (454B) | `FMA5X2400AL` | $4,900 | Wall AH pair; approved clean |
| **The Griffin** | `GLXS4BA2410A` | `AWST24SU1305` | $5,200 | Wall AH + R32 condenser |

### Hue97 preference (454B / A5AC)

| Tonnage | Condenser | AH | Notes |
|---------|-----------|-----|-------|
| 2.5T | `A5AC4030` | `30HXS05` | Repeated (e.g. E207, E202) |
| 3T | `A5AC4036` | `36HXS05` | B301 Hue97; property **prefers A5AC**; stock often special-order from Trane |
| 3T (fallback) | `GLXS4BA3610A` / `GLXS5BA3610A` | `36HX5` / `36HXS05` | Lonzo: use GLX if A5AC unavailable |

Javier (2026-08-26 B301): *“Yea but it isn't a 454 ;) … Biscayne is good”* — Biscayne 3T on GLX/HXS is fine; Hue97 wants A5AC/454B.

### Heat pump / closet (non-default — escalate)

| Property | Condenser | AH | Notes |
|----------|-----------|-----|-------|
| **Indigo** | `GLZS4BA3610A` / `GLZS4BA3010A` | Multi-position / `A4AH4P30` / `A4AH4P36` + **A2L sensor** | HP Closet AH; often AH not selected on estimate; stock/order heavy |

### Refrigerant families (for matching rules)

| Family | Example SKUs | When used |
|--------|--------------|-----------|
| **R-32 Goodman GLX** | `GLXS4BA*`, `24/30/36HXS05` | Default SC ceiling for most apts |
| **R-454B A5AC / FMA5** | `A5AC4024/30/36`, `FMA5X2400AL` | Hue97 preference; Park Mesa wall; backup when GLX stock out |
| **HP GLZS** | `GLZS4BA*` | Indigo / closet HP |
| **Wall AWST** | `AWST24SU1305` | Griffin wall AH |

Lonzo (2026-08-03): 454B priced same as R32 for interim stock; **must put correct equipment on the req**.

---

## 3. Property → equipment patterns (frequent properties)

| Property | Typical approved equipment | Install type | Job N/A OK? | Special flags |
|----------|---------------------------|--------------|-------------|---------------|
| **Rise Broadway** | `GLXS4BA2410A` (± A2L sensor) | Condenser-only SC common; also full 2T ceiling | Yes | **A2L sensor** on condenser installs |
| **The Clifford** | `24HXS05` + `GLXS4BA2410A` | 2T SC Ceiling | Yes | Schedule/crane confirm sometimes (Liz) |
| **Station 21** | `24HXS05` + `GLXS4BA2410A` | 2T SC Ceiling | Yes | Apt # mismatch estimate vs booking (Javier flag) |
| **Cornerstone Ranch** | 2T: `24HXS05`+`GLXS4BA2410A`; 2.5T: `GLXS4BA3010A`+`30HXS05` | Ceiling | Yes | One decline then re-approve same SKUs (2026-08-26 #2106) |
| **IMT Ahwatukee** | `24HXS05` + `GLXS4BA2410A` | 2T Ceiling (high volume) | Yes | Property note (2025): sometimes **AH-only / property-supplied condenser** (410A batch) |
| **Ovation / Ovation Tempe** | `24HXS05` + `GLXS4BA2410A` | 2T Ceiling | Mixed | Very frequent |
| **Rise Encore / Rise Desert Cove / Rise Valley Heights / Rise Mountain Ridge / Rise McClintock / Rise Suncrest** | Mostly `24HXS05`+`GLXS4BA2410A` | 2T Ceiling / condenser | Yes | Rise Desert Cove: A2L on condenser replacement discussed |
| **Montero at Dana Park** | 2T: `24HXS05`+`GLXS4BA2410A`; 2.5T: `GLXS4BA3010A`+`30HXS05`; 3T: `36HX*`+`GLXS4BA3610A` | Ceiling | Often N/A | Historic **wrong tonnage** decline (3T sold → field used 2.5T) |
| **Hue97** | Prefer `A5AC4030/36` + matching HXS; else GLX | Ceiling / odd line items | Mixed | **454B preference**; stock checks; A2L sensor timing |
| **Desert Eagle** | 3T: `GLXS4BA3610A`+`36HXS05`; also 2T GLX pair | Ceiling | Mixed | Requisition follow-ups |
| **Biscayne Bay** | 2T GLX pair; 3T `GLXS4BA3610A`+`36HXS05` | Ceiling | Mixed | 3T GLX OK (vs Hue97 454) |
| **Talise / Sonoran / Residences / The Turn / The Core / Dana Park** | Standard tonnage GLX+HXS pairs | Ceiling | Mixed | Residences #2104: **sold as 2.5T but should be 2T** (post-approve correction) |
| **Park Mesa** | `A5AC4024` + `FMA5X2400AL` | Wall AH | Yes | Non-default SKUs but property-consistent |
| **The Griffin** | `GLXS4BA2410A` + `AWST24SU1305` | Wall AH $5200 | Mixed | Package HP / crane holds historically |
| **Cambria** | 2.5T/3T GLX+HXS | Ceiling | Mixed | Stock delays; A2L sensor follow-ups |
| **San Riva / Village at Sun Valley / Olive East / Morgan Park / Renue / La Costa** | Standard GLX pairs by tonnage | Ceiling | Mixed | — |
| **Indigo** | `GLZS4BA*` + closet multi-pos AH + A2L | HP Closet | No — needs human | AH selection / order / duplicate line items |

---

## 4. Decline reasons (when visible)

| Date (PT) | Estimate / Property | Declined by | Equipment on post | Reason / outcome |
|-----------|---------------------|-------------|-------------------|------------------|
| 2026-08-26 | Cornerstone #2106 | lonzo | `GLXS4BA3010A`, `30HXS05` | Declined then **same SKUs** re-approved / warehouse (correction path; reason not spelled out in thread) |
| 2026-06-19 | Station 21 #1032 | **Manny** | Standard 2T pair | **Accidental click** — “Oops clicked by accidentally”; Josh: restrict who can approve |
| 2026-06-16 | Dana Park Office | Ish | `A4AC4042` (3.5T condenser) | **Pocket / accidental** — “My pocket denied it lol”; then approved |
| 2026-06-15 | Hue97 #D103 | lonzo | `36HX5`, `A5AC4036` | **Wrong equipment** — lonzo switched condenser to **GLX / 3Ton R32**; Javier: “corrected to a 3Ton R32” |
| 2026-06-02 | Indigo #228 | lonzo | `GLZS4BA3610A`, `3Ton Multi-Position AH` | Needed AH model / order; then **duplicate service items** on estimate (Josh/Ale) |
| 2026-05-14 | Hue97 #F208 | lonzo | Standard 2T GLX pair | Declined → corrected → Javier asked for **updated requisition** |
| 2026-05-05 | Indigo #115 | (pending buttons) | `GLZS4BA3010A`, `2.5Ton Multi-Position AH` | **AH not chosen**; stock: AH `A4AH4P30` in stock, condenser order |
| 2026-04-27 | Cambria #1055 | lonzo | `36HX5`, `GLXS4BA3610A` | Physical unit had **leak**; stick with listed GLXS4BA3610 |
| 2026-04-13 | Montero #1064 | lonzo | `36HX5`, `GLXS4BA3610A` | **Wrong tonnage in field** — sold 3T, used **2.5T** (`30HX5` + GLX 2.5); warehouse fulfilled wrong vs truck |
| 2026-07-01 | La Frontera | (buttons) | `Misc Equipment` ×2 | Non-SKU / ductless — not a standard auto path |
| 2026-06-21 | Griffin Elevator | (hold) | `2Ton HP Package System` | Ish: **hold for crane** / tough spot — not a clean approve |

**Noise:** Several declines are accidental UI clicks. Real declines cluster around **wrong SKU/refrigerant**, **tonnage mismatch**, **missing AH SKU**, **stock/physical unit issues**, **package/crane complexity**.

---

## 5. Human thread flags (escalate signals)

Concrete phrases/events that should block auto-approve or force review:

| Flag | Example | Implication |
|------|---------|-------------|
| **A2L sensor** | Rise Broadway #1137 — Haley/Ish: condenser needs A2L | Add sensor to fulfillment; don’t treat as SKU-only |
| **Wrong tonnage** | Residences #2104 — “supposed to be a 2-ton”; Montero Apr — 3T sold / 2.5T installed | SKU↔line-item tonnage mismatch |
| **Stock / not at HQ** | Hue97 B301 — “We do not have it in HQ”; order Trane pickup | Need warehouse ETA before book |
| **454B vs R32 / property preference** | Hue97 prefers A5AC; GLX fallback | Property-specific refrigerant rule |
| **Apt # mismatch** | Station 21 — estimate 3153 vs booking 3115 | Data integrity before warehouse |
| **Schedule / crane / property confirm** | Clifford — Liz hold load until property + crane | Ops logistics, not SKU |
| **Duplicate line items** | Indigo — duplicate service on estimate | Estimate hygiene |
| **Misc Equipment / Package HP / ductless** | La Frontera, Griffin package | Non-canonical SKUs |
| **ST inventory lies** | Cambria — ST said available; unit already taken for San Riva | Don’t trust ST qty alone |
| **Property-supplied condenser / AH-only** | IMT Ahwatukee historical note | Different bill of materials |

---

## 6. Auto-approve heuristics (recommended)

### SAFE to auto-approve (high confidence)

All of the following:

1. Line item matches one of:
   - `*Ton System Install (SC Condenser & Ceiling AH)` with matching tonnage SKUs below, **or**
   - Condenser-only SC with single `GLXS4BA2410A` on **Rise Broadway / Rise Suncrest / Rise McClintock** (still queue **A2L sensor** checklist item).
2. SKU set is exactly one of:
   - 2T ceiling: `{GLXS4BA2410A, 24HXS05}`
   - 2.5T ceiling: `{GLXS4BA3010A, 30HXS05}`
   - 3T ceiling: `{GLXS4BA3610A, 36HXS05}` (accept legacy `36HX5` as alias)
3. Property is in the “frequent ceiling” set (Clifford, Station 21, Cornerstone, IMT Ahwatukee, Ovation*, Rise Encore/Desert Cove/Valley Heights/Mountain Ridge, Montero, Sonoran, Talise, The Turn, Dana Park APT, Olive East, Morgan Park, Biscayne 2T, etc.) **and** SKUs match property history.
4. No `Misc Equipment`, no HP/closet line item, no Wall AH unless property is Park Mesa / Griffin with exact pairs above.
5. Job may be `#N/A` — **do not escalate solely for missing job**.

### ESCALATE to human (lonzo / Ish / Javier)

Escalate if **any**:

| Rule | Why |
|------|-----|
| SKUs not in canonical pairs above | Unusual / property-specific |
| **Hue97** + anything other than known A5AC+HXS or documented GLX fallback | 454B preference + stock |
| Line contains **Wall AH**, **Closet AH**, **HP**, **Package**, **ductless**, **Misc** | Non-default install |
| **Indigo** or any `GLZS*` / Multi-Position AH | Order + A2L + AH selection |
| Tonnage in title ≠ tonnage encoded in SKUs (24/30/36) | Residences / Montero class errors |
| Park Mesa / Griffin / Rise Canyon West wall patterns but SKUs don’t match known pair | Wrong wall BOM |
| Estimate text looks like labor-only / compressor / PVC re-route with **full system SKUs** attached | Hue97 B301-style odd packaging |
| Prior thread on same property same day mentions stock shortage / A2L shortage | Fulfillment risk |
| Approver history shows decline on this exact SKU set for this property | Learned caution |

### Soft warnings (auto-approve OK but annotate)

- Job `#N/A` → note “book job after approve”  
- Rise Broadway condenser-only → **require A2L sensor** on warehouse checklist  
- Price far outside band for tonnage (e.g. 2T ceiling ≪ $3,900 or ≫ $4,500 without “Discount/HVAC Discount” label)  
- Extended Service Area / odd estimate titles with otherwise normal SKUs  

---

## 7. Distinct properties seen frequently (Aug–Sep 2026 sample)

**High frequency:** Rise Broadway, The Clifford, Station 21, Cornerstone Ranch, IMT Ahwatukee, Ovation / Ovation Tempe, Rise Encore, Rise Desert Cove, Montero at Dana Park, Hue97, Desert Eagle, Biscayne Bay, Residences, The Turn, Sonoran, Talise, The Core / Dana Park APT, Olive East, Morgan Park, Cambria, San Riva, Park Mesa, The Griffin, Rise Mountain Ridge, Rise Valley Heights, Rise Suncrest, Rise McClintock, Village at Sun Valley, Renue, La Costa, Indigo (lower volume, higher complexity).

---

## 8. Approver roles (for automation routing)

| Person | Role in flow |
|--------|----------------|
| **lonzo** | Primary ops equipment approve/decline |
| **Ish** | Ops approve; A2L / install-type judgment; crane holds |
| **Javier** | Warehouse confirm after ops approve; stock reality check; orders |
| **Manny** | Occasional approve/decline (accidental); inventory/orders |
| **Josh** | Escalation / process (“restrict who can approve”) |
| **Ale / Haley / Liz / Denisse** | CSR flags (A2L, apt #, schedule, ST errors) — not primary equip approvers |

---

## 9. Gaps / no single SOP canvas

- Searched canvases for EQUIP / warehouse / requisition / sold: **no dedicated EQUIP SOLD playbook canvas**.  
- Flow knowledge lives in **bot message templates** + tribal knowledge in #d2d-ops threads.  
- Closest written process notes: huddle canvases `F0ATLLSQYF7` (requisition modify/restart) and `F09SXEZ6P37` (CSR correcting req errors).  
- Jessica’s 2026-09-01 **Updated Price List** images in #d2d-ops (Heat Pump / Straight Cool PNGs) are the current price reference, not SKU standards.

---

## 10. Suggested machine-readable allowlist (seed)

```text
# format: property_glob|install_hint|skus|auto
*|SC Ceiling 2T|GLXS4BA2410A+24HXS05|yes
*|SC Ceiling 2.5T|GLXS4BA3010A+30HXS05|yes
*|SC Ceiling 3T|GLXS4BA3610A+36HXS05|yes
*|SC Ceiling 3T legacy AH|GLXS4BA3610A+36HX5|yes
Rise Broadway|SC Condenser only|GLXS4BA2410A|yes+A2L
Park Mesa|SC Wall AH 2T|A5AC4024+FMA5X2400AL|yes
The Griffin|SC Wall AH 2T|GLXS4BA2410A+AWST24SU1305|yes
Hue97|SC Ceiling 2.5T 454|A5AC4030+30HXS05|review-stock
Hue97|SC Ceiling 3T 454|A5AC4036+36HXS05|review-stock
Indigo|*|GLZS*|escalate
*|Wall AH|*|escalate-unless-allowlisted
*|Closet AH / HP|*|escalate
*|Misc Equipment|*|escalate
```

---

*End of report. Generated from Slack #d2d-ops Equipment Sold AutoBot history for auto-approval design.*
