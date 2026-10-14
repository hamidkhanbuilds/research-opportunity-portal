import { useState, useEffect } from "react";
import OpportunityForm from "./OpportunityForm.jsx";
import OpportunityDetails from "./OpportunityDetails.jsx";

// the only place where the API address is written
const apiUrl = "/api/opportunities";

// sends a request to Flask and returns the JSON answer
// it throws an Error with a simple message when something goes wrong
async function callApi(url, method, body) {
  let response;
  try {
    response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (error) {
    throw new Error("Cannot connect to the server. Please check that Flask is running.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    if (data.problems) {
      throw new Error(data.error + ": " + data.problems.join(", "));
    }
    if (data.error) {
      throw new Error(data.error);
    }
    throw new Error("Cannot reach the Flask server (status " + response.status + "). Please check that it is running.");
  }

  return data;
}

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  function showMessage(text, type) {
    setMessage({ text: text, type: type });
  }

  async function loadOpportunities() {
    try {
      const data = await callApi(apiUrl, "GET");
      setOpportunities(data);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message);
    }
    setLoading(false);
  }

  // load the list when the page opens or is refreshed
  useEffect(() => {
    loadOpportunities();
  }, []);

  async function viewDetails(id) {
    try {
      const data = await callApi(apiUrl + "/" + id, "GET");
      setSelectedOpportunity(data);
    } catch (error) {
      showMessage(error.message, "error");
      setSelectedOpportunity(null);
      loadOpportunities();
    }
  }

  // used for both create and update, returns true when it worked
  async function saveOpportunity(formData) {
    try {
      if (editingOpportunity === null) {
        await callApi(apiUrl, "POST", formData);
        showMessage("Research opportunity created successfully.", "success");
      } else {
        const updated = await callApi(apiUrl + "/" + editingOpportunity.id, "PUT", formData);
        showMessage("Research opportunity updated successfully.", "success");
        setEditingOpportunity(null);
        if (selectedOpportunity !== null && selectedOpportunity.id === updated.id) {
          setSelectedOpportunity(updated);
        }
      }
      await loadOpportunities();
      return true;
    } catch (error) {
      showMessage(error.message, "error");
      return false;
    }
  }

  // the PUT endpoint needs the complete record, so only the status is changed
  async function closeOpportunity(opportunity) {
    const closedRecord = { ...opportunity, status: "Closed" };
    try {
      const updated = await callApi(apiUrl + "/" + opportunity.id, "PUT", closedRecord);
      showMessage("Research opportunity closed.", "success");
      if (selectedOpportunity !== null && selectedOpportunity.id === updated.id) {
        setSelectedOpportunity(updated);
      }
      if (editingOpportunity !== null && editingOpportunity.id === updated.id) {
        setEditingOpportunity(updated);
      }
      await loadOpportunities();
    } catch (error) {
      showMessage(error.message, "error");
    }
  }

  async function deleteOpportunity(opportunity) {
    const sure = window.confirm("Delete \"" + opportunity.researchTitle + "\"? This cannot be undone.");
    if (!sure) {
      return;
    }
    try {
      await callApi(apiUrl + "/" + opportunity.id, "DELETE");
      showMessage("Research opportunity deleted successfully.", "success");
      if (selectedOpportunity !== null && selectedOpportunity.id === opportunity.id) {
        setSelectedOpportunity(null);
      }
      if (editingOpportunity !== null && editingOpportunity.id === opportunity.id) {
        setEditingOpportunity(null);
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
    await loadOpportunities();
  }

  function showList() {
    if (loading) {
      return <p className="note">Loading opportunities...</p>;
    }
    if (loadError !== "") {
      return (
        <div className="note errorNote">
          <p>{loadError}</p>
          <button type="button" onClick={loadOpportunities}>Try again</button>
        </div>
      );
    }
    if (opportunities.length === 0) {
      return <p className="note">No research opportunities yet. Use the form to post the first one.</p>;
    }

    return opportunities.map((opportunity) => (
      <div key={opportunity.id} className={"card opportunityCard " + opportunity.status.toLowerCase()}>
        <div className="cardTop">
          <h3>{opportunity.researchTitle}</h3>
          <span className={"badge " + opportunity.status.toLowerCase()}>{opportunity.status}</span>
        </div>
        <p><strong>Area:</strong> {opportunity.researchArea}</p>
        <p><strong>Faculty:</strong> {opportunity.facultyName} ({opportunity.department})</p>
        <p><strong>Positions:</strong> {opportunity.availablePositions} &nbsp;|&nbsp; <strong>Deadline:</strong> {opportunity.applicationDeadline}</p>

        <div className="buttonRow">
          <button type="button" onClick={() => viewDetails(opportunity.id)}>View</button>
          <button type="button" onClick={() => setEditingOpportunity(opportunity)}>Edit</button>
          {opportunity.status === "Open" && (
            <button type="button" className="orangeButton" onClick={() => closeOpportunity(opportunity)}>Close</button>
          )}
          <button type="button" className="redButton" onClick={() => deleteOpportunity(opportunity)}>Delete</button>
        </div>
      </div>
    ));
  }

  return (
    <div>
      <header>
        <h1>University Research Opportunity Portal</h1>
        <p>Post, view, update and manage research opportunities in one place</p>
      </header>

      <main>
        {message !== null && (
          <div className={"message " + message.type} role="alert">
            <span>{message.text}</span>
            <button type="button" className="closeMessage" onClick={() => setMessage(null)}>x</button>
          </div>
        )}

        <div className="layout">
          <section>
            <h2>All opportunities</h2>
            {showList()}
          </section>

          <aside>
            {selectedOpportunity !== null && (
              <OpportunityDetails opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} />
            )}

            {/* the key makes the form start fresh when a different opportunity is edited */}
            <OpportunityForm
              key={editingOpportunity === null ? "new" : editingOpportunity.id}
              opportunity={editingOpportunity}
              onSave={saveOpportunity}
              onCancel={() => setEditingOpportunity(null)}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
