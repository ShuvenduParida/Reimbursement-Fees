# Document Management Module

## Overview

The **Document Management Module** is a React-based application for managing business processes, their activities, the documents required for each activity, and the email templates associated with activities.

The module allows a developer or user to navigate from a **Process** to its **Activities**, manage the required documents for an activity, and configure reusable email templates for that activity.

---

## Main Features

### Process Management
- View the Process List.
- Open the details of a selected Process.
- View Activities under a Process.

### Activity Document Management
- View documents assigned to an Activity.
- Search available document types.
- Add a document to an Activity.
- Update an existing Activity Document.
- Configure whether an Activity Document is mandatory.
- Refresh the document list after changes.

### Email Template Management
- View the email template assigned to an Activity.
- Create a new email template.
- Update an existing email template.
- Search for an existing email template by template name.
- Reuse an existing email template across multiple Activities.
- Link an existing template to an Activity without creating a duplicate.
- Create a completely new template when an existing template should not be modified.
- Configure Information Mail, Reminder Mail, or Information + Reminder.
- Configure reminder subject/body, attachment settings, reminder count, days before, and frequency.
- Auto Enabled option, allowing users to enable or disable automatic processing through a boolean is_auto_enabled field.

---

# Folder Structure

```text
src/
│
├── pages/
│   ├── DocumentManagement/
│   │   ├── DocumentManagement.jsx
│   │   ├── ProcessList.jsx
│   │   ├── ProcessDetails.jsx
│   │   ├── ActivityDocuments.jsx
│   │   ├── SelectDocumentModal.jsx
│   │   └── DocumentManagement.module.css
│   │
│   └── EmailTemplate/
│       ├── EmailTemplate.jsx
│       ├── EmailTemplateForm.jsx
│       └── EmailTemplate.module.css
│
├── services/
│   ├── ConstantServices.js
│   ├── HttpMethod.js
│   └── productServices.js
│
├── context/
│   └── AuthContext.jsx
│
└── App.jsx
```

---

# Module Flow

```text
Process List
     │
     ▼
Process Details
     │
     ▼
Activity List
     │
     ├──────────────────────────────┐
     │                              │
     ▼                              ▼
Activity Documents             Email Template
     │                              │
     ├── View Documents             ├── Load Existing Template
     ├── Add Document               ├── Search Template
     └── Edit Document              ├── Create New Template
                                    ├── Update Template
                                    └── Link Existing Template
```

---

# Components

## DocumentManagement.jsx

Main container component.

### Responsibilities

- Handles module-level routing/navigation.
- Displays module navigation.
- Handles Logout.

---

## ProcessList.jsx

Displays the available Processes.

### Responsibilities

- Fetch Process List.
- Display available Processes.
- Navigate to Process Details.

### API

```text
getProcessList()
```

---

## ProcessDetails.jsx

Displays Activities belonging to the selected Process.

### Responsibilities

- Display Activities of the selected Process.
- Navigate to Activity Documents.
- Navigate to Email Template configuration for an Activity.

### API

```text
getProcessActivityList()
```

---

## ActivityDocuments.jsx

Manages documents assigned to an Activity.

### Responsibilities

- Display Activity information.
- Display the Activity Document list.
- Search/select available document types.
- Add a Document.
- Edit a Document.
- Delete a Document.
- Refresh the Document list.

### Main Functions

#### loadDocumentList()

Fetches Activity Documents from the backend.

```text
getActivityDocumentList()
```

#### handleAddDocument()

Opens the Document Selection Modal.

#### handleSaveRow()

Saves an Activity Document.

The operation depends on the call mode:

```text
call_mode = ADD
call_mode = UPDATE
```

### APIs

```text
addActivityDocument()
updateActivityDocument()
```

#### handleEditRow()

Enables editing of an existing Activity Document.

#### handleRemoveRow()

Removes an Activity Document.

### API

```text
deleteActivityDocument()
```

---

## SelectDocumentModal.jsx

Provides the list of available Document Types that can be assigned to an Activity.

### Responsibilities

- Fetch Document Types.
- Display available Document Types.
- Allow the user to select a Document Type.
- Return the selected Document to ActivityDocuments.

### API

```text
getDocumentTypeList()
```

---

## EmailTemplate.jsx

Main component for configuring the email template of a selected Activity.

### Responsibilities

- Display the email template configuration page.
- Load the template assigned to the selected Activity.
- Open a blank form when no template is assigned.
- Search for an existing template.
- Populate the form with a searched template.
- Create a new Email Template.
- Update an existing Email Template.
- Link an existing Email Template to the current Activity.
- Navigate back to Activity Details.

### APIs

```text
getActivityEmailList()
processActivityEmail()
```

---

## EmailTemplateForm.jsx

Displays and manages the Email Template form.

### Responsibilities

- Display Template Name.
- Display Email Type.
- Display Subject.
- Display Plain Text Body.
- Display HTML Body.
- Display recipient mail list.
- Display attachment configuration.
- Display Reminder configuration when applicable.
- Validate required fields.
- Search for an existing template.
- Create a new template.
- Save the template configuration.

---

# Email Types

The Email Template form supports three email types:

| Value | Email Type |
|---|---|
| `I` | Information Mail |
| `R` | Reminder Mail |
| `B` | Information + Reminder |

The selected email type determines which email configuration is required.

---

# Reminder Configuration

When Reminder Mail functionality is used, the template can contain separate reminder configuration fields.

```text
r_subject
r_body_text
r_body_html
r_file_attached
r_max_number
days_before
days_frequency
```

### Meaning

- `r_subject` — Reminder email subject.
- `r_body_text` — Reminder plain-text body.
- `r_body_html` — Reminder HTML body.
- `r_file_attached` — Whether the reminder has an attachment.
- `r_max_number` — Maximum number of reminder emails.
- `days_before` — Number of days before the configured due date for the reminder.
- `days_frequency` — Frequency between reminder emails.

---

# Email Template Lifecycle

Email Templates have three important operations:

```text
ADD_EMAIL
UPDATE_EMAIL
LINK
```

## 1. ADD_EMAIL

Creates a **new Email Template** and attaches the newly created template to the current Activity.

Use this when:

- No template exists for the Activity.
- The user clicks **Create New Template**.
- The user wants a separate template instead of modifying an existing reusable template.



---

## 2. UPDATE_EMAIL

Updates the existing Email Template assigned to the Activity.

Use this when the user intentionally wants to modify the currently attached template.



### Important

If the same template is linked to multiple Activities, updating that template can affect all Activities using that template.

If the user does **not** want to modify the shared template, use **Create New Template** instead.

---

## 3. LINK

Links an existing Email Template to another Activity.

Use this when an existing template should be reused.



### Important

`LINK` does not create a new Email Template.

It also does not modify the existing template's content.

---

# Reusable Email Templates

An Email Template can be linked to multiple Activities.

Example:

```
Activity A ─────┐
                │
                ▼
           Template #38
                ▲
                │
Activity B ─────┘
```

Both Activities use the same Email Template.

---

# Searching an Existing Email Template

The Template Name field provides a Search option.

### Flow

```text
Enter Template Name
        │
        ▼
Search
        │
        ▼
getActivityEmailList()
        │
        ▼
Existing Template Found
        │
        ▼
Populate form fields
```

The search is based on the template name.

If a template is found, its stored configuration is loaded into the form.

---

## ADD_EMAIL Request

```json
{
  "email_data": {
    "activity_id": 90,
    "call_mode": "ADD_EMAIL",
    "name": "Test Email Template",
    "email_type": "I",
    "subject": "Subject",
    "body_text": "Plain text",
    "body_html": "<html>...</html>",
    "is_file_attached": true,
    "mail_list": "test@example.com",
    "max_number": 1,
    "r_subject": "",
    "r_body_text": "",
    "r_body_html": "",
    "r_file_attached": false,
    "r_max_number": 1,
    "days_before": 30,
    "days_frequency": 7
  }
}
```

### ADD_EMAIL behavior

```
Create EmailTemplate
        ↓
Save EmailTemplate
        ↓
Attach EmailTemplate to Activity
```

---

## UPDATE_EMAIL Request

```json
{
  "email_data": {
    "activity_id": 90,
    "e_template_id": 2,
    "call_mode": "UPDATE_EMAIL",
    "name": "Test Email Template",
    "email_type": "I",
    "subject": "Updated Subject",
    "body_text": "Updated plain text",
    "body_html": "<html>...</html>",
    "is_file_attached": true,
    "mail_list": "test@example.com",
    "max_number": 1,
    "r_subject": "",
    "r_body_text": "",
    "r_body_html": "",
    "r_file_attached": false,
    "r_max_number": 1,
    "days_before": 30,
    "days_frequency": 7
  }
}
```

### UPDATE_EMAIL behavior

```
Find EmailTemplate using e_template_id
        ↓
Update template fields
        ↓
Save existing EmailTemplate
```

---

## LINK Request

```json
{
  "email_data": {
    "activity_id": 90,
    "call_mode": "LINK",
    "e_template_id": 2
  }
}
```

### LINK behavior

```
Find existing EmailTemplate
        ↓
Attach it to current Activity
        ↓
Save Activity
```

No new Email Template is created.

---

# Document Management API Payloads

## ADD

```json
{
  "document_data": {
    "activity_id": 90,
    "document_id": 2,
    "name": "Form 1",
    "is_mandatory": true,
    "call_mode": "ADD"
  }
}
```

---

## UPDATE

```json
{
  "document_data": {
    "activity_document_id": 24,
    "activity_id": 90,
    "document_id": 2,
    "name": "Updated Form",
    "is_mandatory": true,
    "call_mode": "UPDATE"
  }
}
```