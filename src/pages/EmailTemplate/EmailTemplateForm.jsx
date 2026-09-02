import React from "react";
import { emailTypeMap } from "./EmailTemplate.jsx";
import styles from "./EmailTemplate.module.css";



const EMAIL_TYPE_OPTIONS = [
  { value: "I", label: "Information Mail" },
  { value: "R", label: "Reminder Mail" },
  { value: "B", label: "Information + Reminder" },
];

export default function EmailTemplateForm({
  formData,
  errors,
  onFieldChange,
  onSearchTemplate,
  searchingTemplate,
  onCreateNewTemplate,
  onSubmit,
  onCancel,
  saving,
  isCreateMode,
}) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {/* ── Information ───────────────────────────────── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Information Mail Configuration</h2>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="name">
              Template Name <span className={styles.required}>*</span>
            </label>

            <div className={styles.templateSearchRow}>
              <input
                id="name"
                type="text"
                className={`${styles.textInput} ${errors.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="e.g. Invoice Due Reminder"
                disabled={saving}
              />

              <button
                type="button"
                className={styles.searchButton}
                onClick={onSearchTemplate}
                disabled={saving || searchingTemplate}
              >
                {searchingTemplate ? "Searching..." : "Search"}
              </button>
            </div>

            {errors.name && (
              <span className={styles.errorText}>
                {errors.name}
              </span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="email_type">
              Email Type <span className={styles.required}>*</span>
            </label>
            <select
              id="email_type"
              className={`${styles.select} ${errors.email_type ? styles.inputError : ""}`}
              value={formData.email_type}
              onChange={(e) => onFieldChange("email_type", e.target.value)}
              disabled={saving}
            >
              <option value="">Select email type</option>
              {EMAIL_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.email_type && <span className={styles.errorText}>{errors.email_type}</span>}
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="subject">
              Subject <span className={styles.required}>*</span>
            </label>
            <input
              id="subject"
              type="text"
              className={`${styles.textInput} ${errors.subject ? styles.inputError : ""}`}
              value={formData.subject}
              onChange={(e) => onFieldChange("subject", e.target.value)}
              placeholder="Email subject line"
              disabled={saving}
            />
            {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="body_text">
              Plain Text Body
            </label>
            <textarea
              id="body_text"
              className={styles.textarea}
              value={formData.body_text}
              onChange={(e) => onFieldChange("body_text", e.target.value)}
              placeholder="Plain text version of the email body"
              rows={6}
              disabled={saving}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="body_html">
              HTML Body
            </label>
            <textarea
              id="body_html"
              className={styles.textarea}
              value={formData.body_html}
              onChange={(e) => onFieldChange("body_html", e.target.value)}
              placeholder="HTML version of the email body"
              rows={6}
              disabled={saving}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="mail_list">
              Mail List
            </label>
            <input
              id="mail_list"
              type="text"
              className={styles.textInput}
              value={formData.mail_list}
              onChange={(e) => onFieldChange("mail_list", e.target.value)}
              placeholder="e.g. finance@company.com, ops@company.com"
              disabled={saving}
            />
          </div>

          <div className={`${styles.checkboxRow} ${styles.fieldGroupWide}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_file_attached}
                onChange={(e) => onFieldChange("is_file_attached", e.target.checked)}
                disabled={saving}
              />
              File Attached
            </label>
          </div>
          <div className={`${styles.checkboxRow} ${styles.fieldGroupWide}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={Boolean(formData.is_auto_enabled)}
                onChange={(e) => onFieldChange("is_auto_enabled", e.target.checked)}
                disabled={saving}
              />
              Auto Enabled
            </label>
          </div>
        </div>
      </section>

      {/* ── Reminder Configuration ─────────────────────────────── */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Reminder Mail Configuration</h2>
        </div>

        <div className={styles.formGrid}>
          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="r_subject">
              Reminder Subject
            </label>
            <input
              id="r_subject"
              type="text"
              className={styles.textInput}
              value={formData.r_subject}
              onChange={(e) => onFieldChange("r_subject", e.target.value)}
              placeholder="Reminder email subject line"
              disabled={saving}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="r_body_text">
              Reminder Text Body
            </label>
            <textarea
              id="r_body_text"
              className={styles.textarea}
              value={formData.r_body_text}
              onChange={(e) => onFieldChange("r_body_text", e.target.value)}
              rows={5}
              disabled={saving}
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.fieldGroupWide}`}>
            <label className={styles.fieldLabel} htmlFor="r_body_html">
              Reminder HTML Body
            </label>
            <textarea
              id="r_body_html"
              className={styles.textarea}
              value={formData.r_body_html}
              onChange={(e) => onFieldChange("r_body_html", e.target.value)}
              rows={5}
              disabled={saving}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="r_max_number">
              Maximum Reminder Emails
            </label>
            <input
              id="r_max_number"
              type="number"
              min="0"
              className={styles.textInput}
              value={formData.r_max_number}
              onChange={(e) => onFieldChange("r_max_number", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="days_before">
              Days Before Due Date
            </label>
            <input
              id="days_before"
              type="number"
              min="0"
              className={styles.textInput}
              value={formData.days_before}
              onChange={(e) => onFieldChange("days_before", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="days_frequency">
              Reminder Frequency (Days)
            </label>
            <input
              id="days_frequency"
              type="number"
              min="0"
              className={styles.textInput}
              value={formData.days_frequency}
              onChange={(e) => onFieldChange("days_frequency", e.target.value)}
              disabled={saving}
            />
          </div>

          <div className={`${styles.checkboxRow} ${styles.fieldGroupWide}`}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.r_file_attached}
                onChange={(e) => onFieldChange("r_file_attached", e.target.checked)}
                disabled={saving}
              />
              Reminder File Attached
            </label>
          </div>
        </div>
      </section>

      <div className={styles.actionBar}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        {!isCreateMode && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCreateNewTemplate}
            disabled={saving}
          >
            Create New Template
          </button>
        )}

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
