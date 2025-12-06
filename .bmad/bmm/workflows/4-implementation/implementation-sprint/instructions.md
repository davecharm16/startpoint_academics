# Implementation Sprint - Workflow Instructions

```xml
<critical>The workflow execution engine is governed by: {project-root}/.bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>Communicate all responses in {communication_language} and language MUST be tailored to {user_skill_level}</critical>
<critical>This workflow runs AUTOMATICALLY - analyze status, determine next action, and EXECUTE the appropriate sub-workflow</critical>
<critical>Do NOT stop after analysis - automatically chain to and execute the next workflow</critical>
<critical>Continue executing workflows until a story reaches "review" status or project is complete</critical>

<workflow>
  <step n="1" goal="Analyze sprint status and determine current state" tag="sprint-status">
    <critical>MUST read COMPLETE sprint-status.yaml file from start to end</critical>
    <action>Load the FULL file: {sprint_status}</action>
    <action>Read ALL lines from beginning to end - do not skip any content</action>
    <action>Parse the development_status section completely</action>

    <!-- Categorize all items -->
    <action>Categorize all entries into:
      - **Epics**: Keys matching "epic-N" pattern
      - **Stories**: Keys matching "N-N-*" pattern (e.g., "1-1-project-setup")
      - **Retrospectives**: Keys matching "epic-N-retrospective"
    </action>

    <!-- Count by status -->
    <action>Count items by status:
      - Epics: backlog | contexted
      - Stories: backlog | drafted | ready-for-dev | in-progress | review | done
      - Retrospectives: optional | completed
    </action>

    <action>Store these counts for status summary</action>
  </step>

  <step n="2" goal="Display brief status and determine next workflow">
    <output>
# Implementation Sprint

**Project:** {{project_name}} | **Date:** {{date}}

| Epics | Stories |
|-------|---------|
| {{contexted_epic_count}}/{{total_epic_count}} contexted | {{done_story_count}}/{{total_story_count}} done |
    </output>

    <!-- Determine current state and set next workflow to execute -->
    <check if="any story has status 'in-progress'">
      <action>Set {{current_state}} = "STORY_IN_PROGRESS"</action>
      <action>Set {{next_workflow}} = "dev-story"</action>
      <action>Find the in-progress story key as {{active_item}}</action>
      <output>**Resuming:** Story `{{active_item}}` in progress</output>
    </check>

    <check if="any story has status 'review' AND no story is in-progress">
      <action>Set {{current_state}} = "STORY_IN_REVIEW"</action>
      <action>Set {{next_workflow}} = "PAUSE"</action>
      <action>Find stories in review status as {{active_item}}</action>
      <output>
**Pausing:** Story `{{active_item}}` awaiting review

Run `*code-review` to review, then `*story-done` to complete.
      </output>
      <action>HALT - do not auto-continue past review checkpoint</action>
    </check>

    <check if="any story has status 'ready-for-dev' AND no story is in-progress or review">
      <action>Set {{current_state}} = "STORY_READY"</action>
      <action>Set {{next_workflow}} = "dev-story"</action>
      <action>Find the first ready-for-dev story as {{active_item}}</action>
      <output>**Starting:** Story `{{active_item}}` ready for development</output>
    </check>

    <check if="any story has status 'drafted' AND no story is ready-for-dev, in-progress, or review">
      <action>Set {{current_state}} = "STORY_DRAFTED"</action>
      <action>Set {{next_workflow}} = "story-ready"</action>
      <action>Find the first drafted story as {{active_item}}</action>
      <output>**Marking ready:** Story `{{active_item}}`</output>
    </check>

    <check if="any epic is 'contexted' AND all its stories are 'backlog' AND no stories are drafted/ready/in-progress">
      <action>Set {{current_state}} = "EPIC_CONTEXTED_NO_STORIES"</action>
      <action>Set {{next_workflow}} = "create-story"</action>
      <action>Find the contexted epic as {{active_item}}</action>
      <output>**Creating story:** First story for {{active_item}}</output>
    </check>

    <check if="all epics are 'backlog'">
      <action>Set {{current_state}} = "ALL_EPICS_BACKLOG"</action>
      <action>Set {{next_workflow}} = "epic-tech-context"</action>
      <action>Set {{active_item}} = "Epic 1"</action>
      <output>**Contexting:** Epic 1 (Foundation & Public Pages)</output>
    </check>

    <check if="all stories in current epic are 'done' AND more epics remain">
      <action>Set {{current_state}} = "EPIC_COMPLETE"</action>
      <action>Set {{next_workflow}} = "epic-tech-context"</action>
      <action>Find the next backlog epic as {{active_item}}</action>
      <output>**Epic complete!** Contexting next: {{active_item}}</output>
    </check>

    <check if="all epics and stories are 'done'">
      <action>Set {{current_state}} = "PROJECT_COMPLETE"</action>
      <action>Set {{next_workflow}} = "DONE"</action>
      <output>
**PROJECT COMPLETE!**

All epics and stories are done. Congratulations!
      </output>
      <action>HALT - project is complete</action>
    </check>
  </step>

  <step n="3" goal="Execute the determined workflow">
    <critical>Do NOT just recommend - actually EXECUTE the workflow</critical>

    <output>
---
**Executing:** `{{next_workflow}}`
---
    </output>

    <check if="{{next_workflow}} == 'epic-tech-context'">
      <action>Load and execute workflow: {project-root}/.bmad/bmm/workflows/4-implementation/epic-tech-context/workflow.yaml</action>
      <invoke-workflow path="{project-root}/.bmad/bmm/workflows/4-implementation/epic-tech-context/workflow.yaml" />
    </check>

    <check if="{{next_workflow}} == 'create-story'">
      <action>Load and execute workflow: {project-root}/.bmad/bmm/workflows/4-implementation/create-story/workflow.yaml</action>
      <invoke-workflow path="{project-root}/.bmad/bmm/workflows/4-implementation/create-story/workflow.yaml" />
    </check>

    <check if="{{next_workflow}} == 'story-ready'">
      <action>Load and execute workflow: {project-root}/.bmad/bmm/workflows/4-implementation/story-ready/workflow.yaml</action>
      <invoke-workflow path="{project-root}/.bmad/bmm/workflows/4-implementation/story-ready/workflow.yaml" />
    </check>

    <check if="{{next_workflow}} == 'dev-story'">
      <action>Load and execute workflow: {project-root}/.bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml</action>
      <invoke-workflow path="{project-root}/.bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml" />
    </check>

    <check if="{{next_workflow}} == 'PAUSE'">
      <output>
---
**Review Checkpoint**

Story is ready for review. This is a manual checkpoint.

**Next steps:**
1. `*code-review` - Review the implementation
2. `*story-done` - Mark story complete after approval
3. `*implementation-sprint` - Continue to next story
      </output>
      <action>HALT</action>
    </check>

    <check if="{{next_workflow}} == 'DONE'">
      <action>HALT - nothing more to do</action>
    </check>
  </step>

  <step n="4" goal="After sub-workflow completes, check if we should continue">
    <critical>After a workflow completes, re-analyze status and continue if appropriate</critical>

    <action>Re-read sprint-status.yaml to get updated state</action>
    <action>Determine new current_state based on updated status</action>

    <check if="new state is 'STORY_IN_REVIEW' OR 'PROJECT_COMPLETE'">
      <output>
---
**Checkpoint reached.** Run `*implementation-sprint` to continue after review.
      </output>
      <action>HALT</action>
    </check>

    <check if="new state requires another workflow">
      <output>
---
**Continuing to next step...**
      </output>
      <goto step="2">Continue the sprint cycle</goto>
    </check>
  </step>

</workflow>
```
