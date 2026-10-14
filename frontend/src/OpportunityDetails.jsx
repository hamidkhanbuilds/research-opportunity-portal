// shows every field of one opportunity
function OpportunityDetails({ opportunity, onClose }) {
  return (
    <div className="card">
      <h2>Opportunity details</h2>

      <dl>
        <dt>ID</dt>
        <dd>{opportunity.id}</dd>
        <dt>Research title</dt>
        <dd>{opportunity.researchTitle}</dd>
        <dt>Research description</dt>
        <dd>{opportunity.researchDescription}</dd>
        <dt>Research area</dt>
        <dd>{opportunity.researchArea}</dd>
        <dt>Faculty member</dt>
        <dd>{opportunity.facultyName}</dd>
        <dt>Department</dt>
        <dd>{opportunity.department}</dd>
        <dt>Required skills</dt>
        <dd>{opportunity.requiredSkills}</dd>
        <dt>Available positions</dt>
        <dd>{opportunity.availablePositions}</dd>
        <dt>Application deadline</dt>
        <dd>{opportunity.applicationDeadline}</dd>
        <dt>Status</dt>
        <dd>
          <span className={"badge " + opportunity.status.toLowerCase()}>{opportunity.status}</span>
        </dd>
      </dl>

      <button type="button" className="grayButton" onClick={onClose}>
        Hide details
      </button>
    </div>
  );
}

export default OpportunityDetails;
