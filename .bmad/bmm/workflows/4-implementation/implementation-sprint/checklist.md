# Implementation Sprint Workflow Checklist

## Pre-Execution Validation

- [ ] Sprint status file exists at configured location
- [ ] Sprint status file is readable and valid YAML
- [ ] At least one epic exists in the status file
- [ ] Project documentation (PRD, Architecture) is accessible

## Status Analysis

- [ ] All epics correctly categorized by status (backlog/contexted)
- [ ] All stories correctly categorized by status
- [ ] Current state accurately determined
- [ ] Recommended action is appropriate for the state

## Output Quality

- [ ] Status summary is clear and accurate
- [ ] Epic and story counts match actual data
- [ ] Recommended actions are valid for current state
- [ ] Available actions menu is complete

## User Guidance

- [ ] Current state is clearly communicated
- [ ] Next steps are unambiguous
- [ ] Sub-workflow invocation syntax is correct
- [ ] Quick reference provides useful information

## State Transitions (when applicable)

- [ ] Epic contexting leads to story creation guidance
- [ ] Story drafting leads to story-ready guidance
- [ ] Story ready leads to dev-story guidance
- [ ] Dev completion leads to review/done guidance
- [ ] Epic completion leads to retrospective/next epic guidance

## Error Handling

- [ ] Missing sprint status file produces helpful error
- [ ] Invalid YAML produces helpful error
- [ ] Empty sprint status produces helpful guidance
- [ ] All epics done produces appropriate completion message
