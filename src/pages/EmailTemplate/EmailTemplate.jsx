import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify"
import styles from "./EmailTemplate.module.css";
import EmailTemplateForm from "./EmailTemplateForm";
import { FaArrowLeft, FaCheck, FaExclamationTriangle, FaTimes, } from "react-icons/fa";
import { getActivityEmailList, processActivityEmail } from "../../services/productServices";


const EMPTY_FORM = {
  name: "",
  email_type: "",
  subject: "",
  body_html: "",
  body_text: "",
  mail_list: "",
  is_file_attached: false,
  is_auto_enabled: false,
  r_subject: "",
  r_body_html: "",
  r_body_text: "",
  r_file_attached: false,
  r_max_number: "",
  days_before: "",
  days_frequency: "",
};

/** Maps a GET API record onto the form's field shape (ignores any extra,
 *  unmapped backend fields such as the record's own `max_number`). */
export const emailTypeMap = {
  INFO_MAIL: "I",
  REMINDER_MAIL: "R",
  INFO_REMINDER: "B",
};

export const reverseEmailTypeMap = {
  I: "INFO_MAIL",
  R: "REMINDER_MAIL",
  B: "INFO_REMINDER",
};

function mapRecordToFormData(record) {
  return {
    name: record.name || "",
    email_type: emailTypeMap[record.email_type] || "",
    subject: record.subject || "",
    body_html: record.body_html || "",
    body_text: record.body_text || "",
    mail_list: record.mail_list || "",
    is_file_attached: Boolean(record.is_file_attached),
    is_auto_enabled: Boolean(record.is_auto_enabled),
    r_subject: record.r_subject || "",
    r_body_html: record.r_body_html || "",
    r_body_text: record.r_body_text || "",
    r_file_attached: Boolean(record.r_file_attached),
    r_max_number: record.r_max_number ?? "",
    days_before: record.days_before ?? "",
    days_frequency: record.days_frequency ?? "",
  };
}

/** Confirmation modal — shown before Save actually persists anything. */
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={styles.modalPanel}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.primaryButton} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/** Reusable toast notification, auto-dismisses after a few seconds. */
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div className={`${styles.toast} ${isError ? styles.toastError : styles.toastSuccess}`}>
      <span aria-hidden="true">
        {isError ? (
          <FaExclamationTriangle size={14} />
        ) : (
          <FaCheck size={14} />
        )}
      </span>
      <span className={styles.toastMessage}>{toast.message}</span>
      <button
        type="button"
        className={styles.toastClose}
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page container                                                      */
/* ------------------------------------------------------------------ */
export default function EmailTemplate() {
  const location = useLocation();
  const navigate = useNavigate();
  const process = location.state?.process;
  const [searchParams] = useSearchParams();

  const isCreateMode = searchParams.get("mode") === "create";

  const stateActivity = location.state?.activity || null;

  const storedActivity = useMemo(() => {
    if (!isCreateMode) return null;

    try {
      return JSON.parse(
        localStorage.getItem("emailTemplateCreateActivity") || "null"
      );
    } catch (error) {
      console.error("Failed to read create activity:", error);
      return null;
    }
  }, [isCreateMode]);

  const activity = stateActivity || storedActivity;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [templateId, setTemplateId] = useState(null); // set once an existing template is loaded
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchingTemplate, setSearchingTemplate] = useState(false);
  const [isLinkedTemplate, setIsLinkedTemplate] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);


  const isUpdateMode = Boolean(templateId);

  // Case 1: mail_template_name exists -> fetch and populate.
  // Case 2: mail_template_name is null -> blank form, no GET call.
  useEffect(() => {
    if (!activity) return;

    // CREATE NEW TEMPLATE MODE
    // Do not fetch the existing template.
    if (isCreateMode) {
      setFormData(EMPTY_FORM);
      setTemplateId(null);
      setIsLinkedTemplate(false);
      setErrors({});
      setLoadError(null);
      return;
    }

    // Activity does not have an email template yet.
    if (!activity.mail_template_name) {
      setFormData(EMPTY_FORM);
      setTemplateId(null);
      setIsLinkedTemplate(false);
      return;
    }

    // NORMAL MODE:
    // Load the template currently assigned to the activity.
    setLoading(true);
    setLoadError(null);

    getActivityEmailList({
      template_name: activity.mail_template_name,
    })
      .then((res) => {
        const record = (res.data || [])[0];

        if (record) {
          setFormData(mapRecordToFormData(record));
          setTemplateId(record.id);
          setIsLinkedTemplate(false);
        } else {
          setFormData(EMPTY_FORM);
          setTemplateId(null);
          setIsLinkedTemplate(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoadError(
          "Unable to load this email template. Please try refreshing the page."
        );
      })
      .finally(() => setLoading(false));
  }, [activity, isCreateMode]);

  

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);
  const handleSearchTemplate = async () => {
      if (!formData.name.trim()) {
          toast.error("Please enter a Template Name.");
          return;
      }

      try {
          setSearchingTemplate(true);

          const res = await getActivityEmailList({
              template_name: formData.name.trim(),
          });

          const record = (res.data || [])[0];

          if (!record) {
              toast.info("No existing template found.");
              return;
          }

          setFormData(mapRecordToFormData(record));
          setTemplateId(record.id);
          // This template came from Search,
          // so Save should LINK instead of UPDATE.
          setIsLinkedTemplate(true);

          toast.success("Existing template loaded successfully.");
      } catch (err) {
          console.log(err);

          toast.error("Template is not Available.");
      } finally {
          setSearchingTemplate(false);
      }
  };

  const handleCreateNewTemplate = useCallback(() => {
    if (!activity?.activity_id) {
      toast.error("Activity information is not available.");
      return;
    }

    // Store activity information so the newly opened tab can use it.
    localStorage.setItem(
      "emailTemplateCreateActivity",
      JSON.stringify(activity)
    );

    const createUrl = `${window.location.pathname}?mode=create`;

    window.open(createUrl, "_blank", "noopener,noreferrer");
  }, [activity]);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Template name is required.";
    if (!formData.email_type) nextErrors.email_type = "Email type is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [formData]);

  const handleSaveClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      setConfirmOpen(true);
    },
    [validate]
  );

  const handleConfirmSave = useCallback(() => {
    setConfirmOpen(false);
    setSaving(true);

    let callMode = "ADD_EMAIL";

    if (isLinkedTemplate) {
      callMode = "LINK";
    } else if (isUpdateMode) {
      callMode = "UPDATE_EMAIL";
    }

  const payload = {
    email_data: {
      activity_id: activity?.activity_id,
      call_mode: callMode,

      name: formData.name,
      email_type: formData.email_type,

      subject: formData.subject,
      body_html: formData.body_html,
      body_text: formData.body_text,

      mail_list: formData.mail_list,

      max_number: 1,               

      is_file_attached: formData.is_file_attached,
      is_auto_enabled: formData.is_auto_enabled,

      r_subject: formData.r_subject,
      r_body_html: formData.r_body_html,
      r_body_text: formData.r_body_text,

      r_max_number: Number(formData.r_max_number) || 1,

      days_before: Number(formData.days_before) || 0,
      days_frequency: Number(formData.days_frequency) || 0,

      r_file_attached: formData.r_file_attached,
    },
  };


    if (isUpdateMode || isLinkedTemplate) {
      payload.email_data.e_template_id = templateId;
    }

    processActivityEmail(payload)
      .then((res) => {

          toast.success(
            callMode === "LINK"
              ? "Email Template linked successfully"
              : callMode === "UPDATE_EMAIL"
              ? "Email Template updated successfully"
              : "Email Template created successfully"
          );

          // Give the user a moment to read the success message,
          // then return to the Activity page.
          setTimeout(() => {
            localStorage.removeItem("emailTemplateCreateActivity");

            if (isCreateMode) {
              // Return directly to the Process Details page
              // where the activities are displayed.
              if (process?.process_id) {
                navigate(
                  `/document-management/process/${process.process_id}`,
                  {
                    state: {
                      process,
                    },
                  }
                );
              } else {
                // Fallback if process information is unavailable
                navigate("/document-management");
              }
            } else {
              // Normal update/link flow
              navigate(-1);
            }
          }, 1200);

      })
      .catch((err) => {
        console.log(err);
        toast.error(
            err?.response?.data?.error ||
            "Something went wrong while saving the email template."
        );
      })
      .finally(() => setSaving(false));
  }, [isUpdateMode, templateId,isLinkedTemplate, isCreateMode, activity, process, formData, navigate]);

  const handleBack = () => navigate(-1);

  return (
    
    <div className={styles.page}>
      <div className={styles.headerContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Email Template</h1>
        <p className={styles.subtitle}>
          {activity?.activity_name
            ? `Configure the email template for "${activity.activity_name}".`
            : "Configure the email template for this activity."}
        </p>
      </div>

      <div className={styles.breadcrumb}>
        <button type="button" className={styles.linkButton} onClick={handleBack}>
          <span aria-hidden="true"><FaArrowLeft size={14} /></span>
          Back to Activity
        </button>
      </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabPanel}>
          {!activity ? (
            <div className={styles.infoState}>
              <p>No activity was provided to this page.</p>
              <p className={styles.infoStateSub}>
                Please open Email Template from the Process Activity list.
              </p>
              <button type="button" className={styles.secondaryButton} onClick={handleBack}>
                Go Back
              </button>
            </div>
          ) : loading ? (
            <p className={styles.loadingText}>Loading email template...</p>
          ) : loadError ? (
            <div className={styles.infoState}>
              <p>{loadError}</p>
            </div>
          ) : (
            <EmailTemplateForm
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
              onSearchTemplate={handleSearchTemplate}
              searchingTemplate={searchingTemplate}
              onCreateNewTemplate={handleCreateNewTemplate}
              onSubmit={handleSaveClick}
              onCancel={handleBack}
              saving={saving}
              isCreateMode={isCreateMode}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Save Changes"
        message="Are you sure you want to save this Email Template?"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

    </div>
  );
}
