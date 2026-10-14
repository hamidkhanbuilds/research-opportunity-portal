import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

def getConnection():
    return pymysql.connect(
        host=os.getenv("DB_HOST","localhost"),
        port=int(os.getenv("DB_PORT","3306")),
        user=os.getenv("DB_USER","root"),
        password=os.getenv("DB_PASSWORD",""),
        database=os.getenv("DB_NAME","research_portal"),
        cursorclass=DictCursor
    )

# runs one SQL query
def runQuery(sql,values=(),mode="none"):
    connection=getConnection()
    try:
        cursor=connection.cursor()
        cursor.execute(sql,values)

        result=None
        if mode=="all":
            result=cursor.fetchall()
        elif mode=="one":
            result=cursor.fetchone()
        elif mode=="insert":
            result=cursor.lastrowid

        connection.commit()
        cursor.close()
        return result
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
