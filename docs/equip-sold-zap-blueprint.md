# EQUIP SOLD Zap blueprint

Source: Zapier editor for `EQUIP SOLD Zap (ops notification in Slack)`; inspected published view and the existing draft (`v35. "Fixed sms send filter"`). No fields were changed and nothing was published.

## Ordered workflow

### 1. Microsoft Outlook — Custom Frequency
- Frequency shown: every 2 minutes.

### 2. Code by Zapier — Extract Equipment Info
- Inputs: `body_preview`, `subject`, `from_address`, `sent_date` (the published view also showed the Outlook body preview/subject/from/sent date mappings).
- Full Code field (Python; credential values are intentionally redacted):

```python
import requests
import json
import re
from datetime import datetime

email_body = input_data.get('body_preview', '')
from_address = input_data.get('from_address', '')

tenant_id = '2499692698'
client_id = '[REDACTED]'
client_secret = '[REDACTED]'
app_key = '[REDACTED]'

output = {
    'status': 'unknown',
    'formatted_message': '',
    'sms_safe_message': '',
    'equipment_only': '',
    'send_sms': False
}
```

> The editor displayed this as the complete 20-line Code field. Secret-bearing values were redacted from this blueprint.

### 3. Filter by Zapier — Filter conditions
- Rule (only condition): field `2. Send Sms` (value shown as `false`); operator `is true`; no separate value field.

### 4. Slack (1.39.3) — Request approval for sold equipment estimate
- Approval request message:
  ```
  [embedded] 2. Formatted Message: SOLD (No Equipment…0 Est #40773490
  [embedded] 2. Equipment Only: No Equipment Detected
  ```
- Send message as: Zapier Bot
- Approval type: Channel message
- Bot name: Equipment Sold AutoBot
- Bot icon: `https://i.imgur.com/urQcnWc.png`
- Channel: `d2d-ops`
- Approvers: `coolray0084`, `ismaelzazueta1`, `alonsomatamoros111812`
- Mention approvers: Yes
- Include link to automation: No
- Approve button: `Equipment Approved`
- Decline button: Yes; label `Declined (Nel)`
- Require confirmation: No

### 5. Formatter by Zapier — Equipment Extract [Warehouse]
- Transform: Extract Pattern
- Input: `2. Equipment Only` (sample shown: `No Equipment Detected`)
- Pattern: `(?<=\|)[A-Z0-9\-]+`
- Match All: true
- MULTILINE: true
- DOTALL: false
- IGNORECASE: false

### 6–7. Additional draft formatter step(s)
- The draft view revealed an additional formatter sequence before the first Paths block. The later formatter is:
  - Step 7, Formatter by Zapier — `Extract Customer [Warehouse]`.
  - Its downstream mappings are referenced as `7. Output 0` (customer).
- The workflow mappings also reference `6. Output Item 1` and `6. Output Item 2` (equipment), indicating the draft's equipment-extraction formatter is step 6 even though the published summary labels the visible formatter as step 5.

### 8. Paths — Split into paths
- Branches: Path A — Approved; Path B — Declined.

### 9. Path A — Approved — Path conditions
- Field: `4. Status` (sample `Pending`)
- Operator: exactly matches
- Value: `Approved`

### 10. Slack — Send equipment confirmation message
- Channel: `d2d-ops`
- Add Zapier app automatically: Yes
- Message: `Equipment has been verified, ready to sell, requisition and book`
- Send as bot: Yes
- Bot icon: `https://i.imgur.com/urQcnWc.png`
- Include automation link: No
- Auto-expand links: false
- Link usernames/channel names: false
- Thread: `4. Ts` (sample `1780068877.114309`)
- Send Channel Message?: no

### 11. Zapier Tables — Create Install Record
- Table: `[Table] Installs`
- Equipment: `6. Output Item 1` + `6. Output Item 2`
- Date Approved: `10. Message Ts`
- Customer: `7. Output 0`
- Status: `Pending`
- Estimate Id: `2. Estimate Id`

### 12. Webhooks by Zapier — POST to Installs Dashboard
- URL: `https://installs.thecoolguy.cc/api/installs`
- Payload type: json
- Data:
  - `dateApproved`: `4. Message Ts`
  - `equipment`: `6. Output Item 1` + `6. Output Item 2`
  - `customer`: `7. Output 0`
  - `status`: `11. Status`
  - `estimateID`: `2. Estimate Id`
- Wrap request in array: true
- Unflatten: true
- Header: `Content-Type: application/json`

### 13. Slack — Warehouse Equipment Readiness check
- Approval request message starts: `@warehouse-team Equipment Sold Approved Please locate and prepare:` followed by embedded `2. Formatted Message` and `2. Equipment Only` values.
- Send as: Zapier Bot
- Approval type: Channel message
- Bot name: EquipmentBot
- Bot icon: `https://i.imgur.com/jPzm4kZ.png`
- Channel: `d2d-ops`
- Parent message: `4. Ts` (sample `1780068877.114309`)
- Approvers: `jortiz00`, `ian_jes707`
- Mention approvers: No
- Include automation link: No
- Approve label: `Equipment Ready`
- Decline button: Yes; label `Equipment Not Ready (Add Details)`
- Require confirmation: Yes
- Approve confirmation title: `Are we sure about this decision?`
- Approve confirmation message: `Only approve this message once you have located and prepared the equipment to be fulfilled the day of Install.`
- Approve confirm/cancel: `Aye` / `Siempre No`
- Decline confirmation title: `Are you sure about that?`
- Decline confirmation message: `Did you double triple checked and are sure we cannot get this equipment ready?`
- Decline confirm/cancel: `Double-Tripple Checked` / `Nevermind`

### 14. Paths — Split into paths
- Branches: Equipment Ready; Equipment not Ready.

### 15. Equipment Ready — Path conditions
- Field: `13. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Approved`

### 16. Slack — Send equipment ready confirmation
- Branch notification; the visible draft card is Slack (1.39.3), with the ready-confirmation configuration.

### 17. Zapier Tables — Update Install Record to Ready
- Table: `[Table] Installs`
- Record ID: `11. Record ID`
- Equipment: `6. Output Item 1` + `6. Output Item 2`
- Date Approved: `4. Message Ts`
- Customer: `7. Output 0`
- Status: `Ready`

### 18. Webhooks by Zapier — Set Ready on Install Dashboard
- URL: `https://installs.thecoolguy.cc/api/installs/` + `12. Ids`
- Payload type: json
- Data: `status = Ready`
- Wrap request in array: false
- Unflatten: true

### 19. Equipment not Ready — Path conditions
- Field: `13. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Declined`

### 20. Slack — Send equipment not ready confirmation
- Channel: `d2d-ops`
- Add Zapier app automatically: Yes
- Message: `Equipment cannot be prepared. (` + `13. Responder Username` + `, please add details).`
- Send as bot: Yes
- Bot name: EquipmentBot
- Bot icon: `https://i.imgur.com/jPzm4kZ.png`
- Include automation link: No
- Auto-expand links: false
- Link usernames/channel names: true
- Thread: `4. Ts` (sample `1780068877.114309`)
- Send Channel Message?: no

### 21. (Draft numbering gap / declined branch continuation)
- The draft displayed a second declined branch beginning at step 21, indicating the editor's branch-local numbering is not globally contiguous.

### 22. Slack — Request Approval
- Approval message: `Please make changes and confirm. Only then requisition can be sent and job booked.`
- Send as: Zapier Bot; approval type: Channel message
- Bot name: Equipment Sold AutoBot
- Bot icon: `https://i.imgur.com/urQcnWc.png`
- Channel: `d2d-ops`
- Parent message: `4. Ts` (sample `1780068877.114309`)
- Approvers: none shown
- Mention approvers: No
- Include automation link: No
- Approve label: `Corrected`
- Decline button: Yes; label `SOS`
- Require confirmation: No

### 23. Paths — Split into paths
- Branches: Path A — Corrected; Path B — SOS.

### 24. Path A — Corrected — Path conditions
- Field: `22. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Approved`

### 25. Slack — Send Channel Message
- Channel: `d2d-ops`
- Add Zapier app automatically: true
- Message: `Equipment has been corrected and verified, ready to sell, requisition and book`
- Send as bot: Yes
- Bot icon: `https://i.imgur.com/urQcnWc.png`
- Include automation link: No
- Remaining Slack toggles follow the standard channel-message defaults shown in the editor.

### 26. Zapier Tables — Create Install Record
- Table: `[Table] Installs`
- Equipment: `6. Output Item 1` + `6. Output Item 2`
- Date Approved: `25. Message Ts`
- Customer: `7. Output 0`
- Status: `Pending`
- Estimate Id: `2. Estimate Id`

### 27. Webhooks by Zapier — POST to Installs Dashboard
- URL: `https://installs.thecoolguy.cc/api/installs`
- Payload type: json
- Data: `dateApproved = 4. Message Ts`; `equipment = 6. Output Item 1 + 6. Output Item 2`; `customer = 7. Output 0`; `status = 26. Status`
- Wrap request in array: true
- Unflatten: true

### 28. Slack — Warehouse Equipment Readiness check (second occurrence)
- Same approval flow as step 13, with Bot name shown as `Equipment Bot` (space), bot icon `https://i.imgur.com/jPzm4kZ.png`, channel `d2d-ops`, approvers `jortiz00`, `ian_jes707`, mention approvers No, approval `Equipment Ready`, decline `Equipment Not Ready (Add Details)`, and confirmation prompts/buttons as listed in step 13.

### 29. Paths — Split into paths
- Branches: Equipment Ready; Equipment not Ready.

### 30. Equipment Ready — Path conditions
- Field: `28. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Approved`

### 31. Slack — Copy: Send equipment ready confirmation
- Channel: `d2d-ops`
- Add Zapier app automatically: Yes
- Message: `Equipment has been prepared by Warehouse and is ready to be fulfilled.`
- Send as bot: Yes
- Bot name: EquipmentBot
- Bot icon: `https://i.imgur.com/jPzm4kZ.png`
- Include automation link: No
- Auto-expand links: false
- Link usernames/channel names: false
- Thread: `4. Ts` (sample `1780068877.114309`)
- Send Channel Message?: no

### 32. Zapier Tables — Update Install Record to Ready
- Table: `[Table] Installs`
- Record ID: `26. Record ID`
- Equipment: `6. Output Item 1` + `6. Output Item 2`
- Date Approved: `4. Message Ts`
- Customer: `7. Output 0`
- Status: `Ready`

### 33. Webhooks by Zapier — Set Ready on Install Dashboard
- URL: `https://installs.thecoolguy.cc/api/installs/` + `27. Ids`
- Payload type: json
- Data: `status = Ready`
- Wrap request in array: false
- Unflatten: true

### 34. Equipment not Ready — Path conditions
- Field: `28. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Declined`

### 35. Slack — Copy: Send equipment not ready confirmation
- Channel: `d2d-ops`
- Add Zapier app automatically: Yes
- Message: `Equipment cannot be prepared. (` + `28. Responder Name` + `, please add details).`
- Send as bot: Yes
- Bot name: EquipmentBot
- Bot icon: `https://i.imgur.com/jPzm4kZ.png`
- Include automation link: No
- Auto-expand links: false
- Link usernames/channel names: true
- Thread: `4. Ts` (sample `1780068877.114309`)
- Send Channel Message?: no

### 36. Zapier Tables — Update Install Record to Not Ready
- Table: `[Table] Installs`
- Same update mappings as step 32; status is `Not Ready`.

### 37. Webhooks by Zapier — Set Not Ready on Install Dashboard
- URL: `https://installs.thecoolguy.cc/api/installs/` + `27. Ids`
- Payload type: json
- Data: `status = Not Ready`
- Wrap request in array: false
- Unflatten: true

### 38. Path B — SOS — Path conditions
- Field: `22. Status` (sample `Declined`)
- Operator: exactly matches
- Value: `Declined`

### 39. Slack — Send Direct Message
- Send Multi Message: false
- To Username: `Manny`
- Message Text: `Yo Momma, come fix this`
- Send as a bot: Yes
- Include automation link: No
- Auto-expand links: false
- Link usernames/channel names: true

## Screenshots / evidence
- Browser snapshots were captured during inspection at the Zapier page; the browser tool did not expose filesystem paths for those captures.
- No local screenshot files were created by the browser tool, so there are no screenshot paths to list.
