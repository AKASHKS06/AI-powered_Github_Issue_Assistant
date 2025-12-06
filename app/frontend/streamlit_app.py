import streamlit as st
import requests

API = "http://localhost:8000/analyze_issue"

st.title("🧠 AI GitHub Issue Assistant")
repo = st.text_input("GitHub Repo URL")
num = st.number_input("Issue Number", min_value=1, step=1)
clicked = st.button("Analyze")

if clicked:
    with st.spinner("Analyzing..."):
        try:
            response = requests.post(API, json={"repo_url": repo, "issue_number": int(num)})
            st.json(response.json())
        except Exception as e:
            st.error(e)
