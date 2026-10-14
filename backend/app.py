from datetime import datetime
from flask import Flask,jsonify,request
from pymysql import Error as DatabaseError
from werkzeug.exceptions import HTTPException
from db import runQuery

app=Flask(__name__)

textFields=["researchTitle","researchDescription","researchArea","facultyName","department","requiredSkills"]
maxLengths={"researchTitle":200,"researchDescription":5000,"researchArea":100,"facultyName":100,"department":100,"requiredSkills":255}
validStatuses=["Open","Closed"]

selectColumns="id, research_title AS researchTitle, research_description AS researchDescription, research_area AS researchArea, faculty_name AS facultyName, department, required_skills AS requiredSkills, available_positions AS availablePositions, application_deadline AS applicationDeadline, status"

def errorResponse(message,code,problems=None):
    body={"error":message}
    if problems:
        body["problems"]=problems
    return jsonify(body),code

# the database gives a date object, JSON needs text
def fixDate(row):
    row["applicationDeadline"]=str(row["applicationDeadline"])
    return row

def findOpportunity(opportunityId):
    row=runQuery("SELECT "+selectColumns+" FROM research_opportunities WHERE id=%s",(opportunityId,),"one")
    if row is None:
        return None
    return fixDate(row)

# returns a list of problems, an empty list means the data is valid
def validateOpportunity(data):
    problems=[]

    if not isinstance(data,dict):
        return ["Missing or invalid JSON data"]

    for field in textFields:
        value=data.get(field)
        if value is None:
            problems.append(field+" is required")
        elif not isinstance(value,str):
            problems.append(field+" must be text")
        elif value.strip()=="":
            problems.append(field+" cannot be empty")
        elif len(value.strip())>maxLengths[field]:
            problems.append(field+" is too long (maximum "+str(maxLengths[field])+" characters)")

    positions=data.get("availablePositions")
    if positions is None:
        problems.append("availablePositions is required")
    elif isinstance(positions,bool) or not isinstance(positions,int) or positions<1 or positions>1000:
        problems.append("availablePositions must be a whole number from 1 to 1000")

    deadline=data.get("applicationDeadline")
    if deadline is None:
        problems.append("applicationDeadline is required")
    elif not isinstance(deadline,str) or len(deadline)!=10:
        problems.append("applicationDeadline must be a date in YYYY-MM-DD format")
    else:
        try:
            datetime.strptime(deadline,"%Y-%m-%d")
        except ValueError:
            problems.append("applicationDeadline is not a valid date")

    status=data.get("status")
    if status is None:
        problems.append("status is required")
    elif status not in validStatuses:
        problems.append("status must be Open or Closed")

    return problems

# values in the same order as the %s marks in the SQL queries
def getValues(data):
    return (
        data["researchTitle"].strip(),
        data["researchDescription"].strip(),
        data["researchArea"].strip(),
        data["facultyName"].strip(),
        data["department"].strip(),
        data["requiredSkills"].strip(),
        data["availablePositions"],
        data["applicationDeadline"],
        data["status"]
    )

@app.route("/api/opportunities",methods=["POST"])
def createOpportunity():
    data=request.get_json(silent=True)
    problems=validateOpportunity(data)
    if problems:
        return errorResponse("Invalid data",400,problems)

    newId=runQuery(
        "INSERT INTO research_opportunities (research_title, research_description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        getValues(data),
        "insert"
    )
    return jsonify(findOpportunity(newId)),201

@app.route("/api/opportunities",methods=["GET"])
def getOpportunities():
    rows=runQuery("SELECT "+selectColumns+" FROM research_opportunities ORDER BY id DESC",(),"all")
    opportunities=[]
    for row in rows:
        opportunities.append(fixDate(row))
    return jsonify(opportunities),200

@app.route("/api/opportunities/<int:opportunityId>",methods=["GET"])
def getOpportunity(opportunityId):
    opportunity=findOpportunity(opportunityId)
    if opportunity is None:
        return errorResponse("Research opportunity not found",404)
    return jsonify(opportunity),200

@app.route("/api/opportunities/<int:opportunityId>",methods=["PUT"])
def updateOpportunity(opportunityId):
    if findOpportunity(opportunityId) is None:
        return errorResponse("Research opportunity not found",404)

    data=request.get_json(silent=True)
    problems=validateOpportunity(data)
    if problems:
        return errorResponse("Invalid data",400,problems)

    runQuery(
        "UPDATE research_opportunities SET research_title=%s, research_description=%s, research_area=%s, faculty_name=%s, department=%s, required_skills=%s, available_positions=%s, application_deadline=%s, status=%s WHERE id=%s",
        getValues(data)+(opportunityId,)
    )
    return jsonify(findOpportunity(opportunityId)),200

@app.route("/api/opportunities/<int:opportunityId>",methods=["DELETE"])
def deleteOpportunity(opportunityId):
    if findOpportunity(opportunityId) is None:
        return errorResponse("Research opportunity not found",404)

    runQuery("DELETE FROM research_opportunities WHERE id=%s",(opportunityId,))
    return jsonify({"message":"Research opportunity deleted successfully"}),200

# database problems: show a simple message, print the real reason only in the Flask terminal
@app.errorhandler(DatabaseError)
def handleDatabaseError(error):
    print("Database error:",error)
    return errorResponse("Database error. Please check that MySQL is running.",500)

@app.errorhandler(Exception)
def handleOtherError(error):
    if isinstance(error,HTTPException):
        return errorResponse(error.name,error.code)
    print("Server error:",error)
    return errorResponse("Internal server error",500)

if __name__=="__main__":
    app.run(host="127.0.0.1",port=5000)
