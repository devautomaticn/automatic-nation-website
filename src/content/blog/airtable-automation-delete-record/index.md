---
title: "Airtable Automation Delete Record: How to Automate Deleting Records Easily"
description: Learn how to automate record deletion with Airtable automation
  delete record and keep your bases organized effortlessly.
published: 2025-11-12
hero: ./hero.webp
heroAlt: ""
wpId: 1298
---

If you want to keep your Airtable bases organized, automating record deletion with **Airtable automation delete record** is a smart solution. Whether you need to remove old records, clear duplicates, or reset logs, automating this task saves time and prevents errors.

In this guide, you’ll learn how to create an Airtable automation that deletes records automatically when you check a box. Note that this feature requires a **paid Airtable plan** because it uses the “Run a Script” automation action.

## Why Use Airtable Automation to Delete Records?

Manually deleting records can be slow and error-prone. Using **Airtable automation delete record** helps you:

- **Save time:** No more scrolling to find records to delete.
- **Ensure consistency:** Deletion rules apply uniformly.
- **Reduce errors:** Scripts delete exactly what you specify.

Common cases where this automation shines include:

- Removing records older than one year without oversight.
- Deleting duplicates flagged by your team or other automations.
- Automatically clearing logs or reports on a daily or weekly basis.

For more ways to automate business processes, refer to this [SMB marketing automation guide](/smb-marketing-automation-work-smarter-not-harder/).

## Step-by-Step Guide: Set Up Airtable Automation to Delete Records

### 1. Prepare Your Airtable Table

Add a checkbox field named something like “Delete.” When you check this box, the automation triggers to delete that record.

### 2. Create the Automation

- Go to the **Automations** tab in your Airtable base.
- Click **Create an automation**.
- Set the trigger to **When record matches conditions**.
- Define the condition: the “Delete” checkbox is checked.

### 3. Use the “Run a Script” Action to Delete Records

Since deleting records isn’t a built-in automation action, use “Run a Script.” Paste this script into the editor:

```
let {recordId, tableId} = input.config();
await base.getTable(tableId).deleteRecordAsync(recordId);
```

### 4. Add Input Variables

Configure input variables (left margin of your script) to specify which record and table you want to delete from:

- **recordId:** the triggering record’s ID.
- **tableId:** the table’s ID where deletion occurs.

Add these in the automation setup: set **recordId** to the record’s ID and **tableId** to your table.

### 5. Test and Activate

Test by checking the “Delete” box on a record. If successful, the record will delete automatically. Then enable the automation to run continuously.

## Advanced Tip: Cascade Deletions for Linked Records

To keep your base clean, extend this script to delete linked child records automatically. Use repeating groups to trigger deletions in related tables, enabling **cascade deletion**. This ensures deleting a parent record removes all connected child records, maintaining data consistency.

## Important: Requires Airtable Paid Plan

The “Run a Script” action is only available on Airtable’s paid plans. For a comparison, see our [Airtable pricing guide](/airtable-pricing-compare-plans-and-choose-the-best-one/) to find the best option for your needs.

## Conclusion: Boost Productivity with Airtable Automation Delete Record

Using **Airtable automation delete record** saves time, reduces errors, and keeps your bases tidy. With this setup, you can:

- Automatically delete old or irrelevant records.
- Remove duplicates flagged by your team.
- Reset logs without manual effort.

Want to explore more Airtable automation tips? Visit our [Airtable automations guide to boost productivity](/airtable-automations-boost-your-workflow-productivity/).

### Related Resources

- [Asana + Airtable Integration for Task Management](/asana-airtable-integration-streamline-task-management-easily/)
- [What Is Low-Code Automation?](/what-is-low-code-automation/)

Happy automating! 🚀

_Learn more about Airtable and automation at&#x20;_[_Automatic Nation_](/)_._
