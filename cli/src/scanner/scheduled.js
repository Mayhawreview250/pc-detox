import { runPS, parseJSON } from '../utils/powershell.js';

/**
 * Scan scheduled tasks.
 * @returns {object} { tasks: [...], totalCount: number }
 */
export async function scanScheduled() {
  const result = runPS(
    "Get-ScheduledTask | Where-Object { $_.State -ne 'Disabled' } | Select-Object TaskName, TaskPath, State, Description, @{N='Author';E={$_.Principal.UserId}}, @{N='Actions';E={($_.Actions | Select-Object -First 1).Execute}} | ConvertTo-Json",
    { timeout: 30000 }
  );

  const data = parseJSON(result.stdout);
  if (!data) {
    return { tasks: [], totalCount: 0, error: 'Failed to scan scheduled tasks' };
  }

  const tasks = (Array.isArray(data) ? data : [data])
    .filter(t => t.TaskName)
    .map(t => {
      const path = (t.TaskPath || '').toLowerCase();
      let category = 'other';
      let canDisable = true;

      if (path.includes('\\microsoft\\windows\\')) {
        category = 'windows';
        canDisable = false; // Windows system tasks - don't touch
      } else if (path.includes('\\microsoft\\')) {
        category = 'microsoft';
      } else if (t.Author && t.Author.toLowerCase().includes('system')) {
        category = 'system';
        canDisable = false;
      }

      return {
        name: t.TaskName,
        path: t.TaskPath || '',
        state: t.State || 'Unknown',
        description: t.Description || '',
        author: t.Author || '',
        action: t.Actions || '',
        category,
        canDisable,
      };
    });

  // Only show non-Windows-system tasks by default
  const userTasks = tasks.filter(t => t.category !== 'windows');

  return {
    tasks: userTasks,
    allTasks: tasks,
    totalCount: tasks.length,
    userCount: userTasks.length,
  };
}
