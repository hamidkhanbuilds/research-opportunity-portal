import { useState } from "react";

const emptyValues = {
  researchTitle: "",
  researchDescription: "",
  researchArea: "",
  facultyName: "",
  department: "",
  requiredSkills: "",
  availablePositions: "",
  applicationDeadline: "",
  status: "Open"
};

const textFieldNames = ["researchTitle", "researchDescription", "researchArea", "facultyName", "department", "requiredSkills"];

const fieldLabels = {
  researchTitle: "Research title",
  researchDescription: "Research description",
  researchArea: "Research area",
  facultyName: "Faculty member's name",
  department: "Department",
  requiredSkills: "Required skills",
  availablePositions: "Available positions",
  applicationDeadline: "Application deadline",
  status: "Status"
};

// when editing, the form starts with the values of the selected opportunity
function getStartValues(opportunity) {
  if (opportunity === null) {
    return emptyValues;
  }
  return {
    researchTitle: opportunity.researchTitle,
    researchDescription: opportunity.researchDescription,
    researchArea: opportunity.researchArea,
    facultyName: opportunity.facultyName,
    department: opportunity.department,
    requiredSkills: opportunity.requiredSkills,
    availablePositions: String(opportunity.availablePositions),
    applicationDeadline: opportunity.applicationDeadline,
    status: opportunity.status
  };
}

// returns an object with one message for each wrong field
function validateForm(values) {
  const newErrors = {};

  textFieldNames.forEach((name) => {
    if (values[name].trim() === "") {
      newErrors[name] = fieldLabels[name] + " is required";
    }
  });

  const positions = Number(values.availablePositions);
  if (values.availablePositions.trim() === "") {
    newErrors.availablePositions = "Available positions is required";
  } else if (!Number.isInteger(positions) || positions < 1 || positions > 1000) {
    newErrors.availablePositions = "Enter a whole number from 1 to 1000";
  }

  if (values.applicationDeadline === "") {
    newErrors.applicationDeadline = "Application deadline is required";
  } else if (isNaN(new Date(values.applicationDeadline).getTime())) {
    newErrors.applicationDeadline = "Enter a valid date";
  }

  if (values.status !== "Open" && values.status !== "Closed") {
    newErrors.status = "Status must be Open or Closed";
  }

  return newErrors;
}

function OpportunityForm({ opportunity, onSave, onCancel }) {
  const [formValues, setFormValues] = useState(getStartValues(opportunity));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const newErrors = validateForm(formValues);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // send the complete record to the API
    const data = {
      researchTitle: formValues.researchTitle.trim(),
      researchDescription: formValues.researchDescription.trim(),
      researchArea: formValues.researchArea.trim(),
      facultyName: formValues.facultyName.trim(),
      department: formValues.department.trim(),
      requiredSkills: formValues.requiredSkills.trim(),
      availablePositions: Number(formValues.availablePositions),
      applicationDeadline: formValues.applicationDeadline,
      status: formValues.status
    };

    setSaving(true);
    const saved = await onSave(data);
    setSaving(false);

    // clear the form after a new opportunity is created
    if (saved && opportunity === null) {
      setFormValues(emptyValues);
    }
  }

  function showError(name) {
    if (errors[name]) {
      return <p className="fieldError">{errors[name]}</p>;
    }
    return null;
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>{opportunity === null ? "Post a new opportunity" : "Edit opportunity #" + opportunity.id}</h2>

      <label htmlFor="researchTitle">{fieldLabels.researchTitle} *</label>
      <input id="researchTitle" name="researchTitle" maxLength="200" value={formValues.researchTitle} onChange={handleChange} />
      {showError("researchTitle")}

      <label htmlFor="researchDescription">{fieldLabels.researchDescription} *</label>
      <textarea id="researchDescription" name="researchDescription" rows="4" maxLength="5000" value={formValues.researchDescription} onChange={handleChange} />
      {showError("researchDescription")}

      <label htmlFor="researchArea">{fieldLabels.researchArea} *</label>
      <input id="researchArea" name="researchArea" maxLength="100" value={formValues.researchArea} onChange={handleChange} />
      {showError("researchArea")}

      <label htmlFor="facultyName">{fieldLabels.facultyName} *</label>
      <input id="facultyName" name="facultyName" maxLength="100" value={formValues.facultyName} onChange={handleChange} />
      {showError("facultyName")}

      <label htmlFor="department">{fieldLabels.department} *</label>
      <input id="department" name="department" maxLength="100" value={formValues.department} onChange={handleChange} />
      {showError("department")}

      <label htmlFor="requiredSkills">{fieldLabels.requiredSkills} *</label>
      <input id="requiredSkills" name="requiredSkills" maxLength="255" placeholder="Example: Python, Statistics" value={formValues.requiredSkills} onChange={handleChange} />
      {showError("requiredSkills")}

      <div className="twoColumns">
        <div>
          <label htmlFor="availablePositions">{fieldLabels.availablePositions} *</label>
          <input id="availablePositions" name="availablePositions" type="number" min="1" max="1000" value={formValues.availablePositions} onChange={handleChange} />
          {showError("availablePositions")}
        </div>
        <div>
          <label htmlFor="applicationDeadline">{fieldLabels.applicationDeadline} *</label>
          <input id="applicationDeadline" name="applicationDeadline" type="date" value={formValues.applicationDeadline} onChange={handleChange} />
          {showError("applicationDeadline")}
        </div>
      </div>

      <label htmlFor="status">{fieldLabels.status} *</label>
      <select id="status" name="status" value={formValues.status} onChange={handleChange}>
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
      </select>
      {showError("status")}

      <div className="buttonRow">
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : opportunity === null ? "Create opportunity" : "Save changes"}
        </button>
        {opportunity !== null && (
          <button type="button" className="grayButton" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default OpportunityForm;
