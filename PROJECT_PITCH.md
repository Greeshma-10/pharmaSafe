# PharmaSafe — Adverse Event Intake & Triage System

## The Problem
Pharma companies have legally mandated deadlines to report serious adverse
drug reactions to health authorities — as tight as 7 days for
life-threatening cases, 15 days for other serious events. Missing these
deadlines carries real regulatory penalty risk.

## The Gap
Enterprise pharmacovigilance systems (Oracle Argus, ArisGlobal LifeSphere,
Veeva Vault Safety) are the systems of record — but they're built for
trained safety specialists, take 6-12 months to implement, and sit
*downstream* of the very first moment a case is reported. That first
contact — a call comes in, someone jots down what happened — often still
happens over email or spreadsheet before it's formally entered into the
enterprise safety database.

## What This Project Is
A lightweight intake and triage layer for that first-contact gap — not a
competitor to Argus/Veeva, but the "front door" before the "vault."
Captures a case, classifies severity, auto-calculates the real regulatory
deadline, escalates cases at risk of breaching it, and maintains a full
audit trail — so nothing falls through the cracks before it reaches the
formal safety team.

## The Elevator Pitch
"I'm not replacing a safety database like Argus — that's a multi-year,
heavily validated system of record. What I built targets the gap before a
case ever reaches that system: fast, structured capture and triage at the
point of first contact, with automated deadline tracking so nothing slips
through before it's formally logged."

## Natural Extension (mentioned, not built)
Exporting cases in E2B(R3) format (FDA's current ICSR submission standard
as of April 2026) for downstream handoff to the enterprise safety database.