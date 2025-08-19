import { Tool } from './base';
import { ToolResult } from '../types';
import { NotificationClient } from '../clients/notification';
import * as tl from 'azure-pipelines-task-lib/task';

/**
 * Tool for sending email notifications
 */
export class SendNotificationTool extends Tool {
    name = 'send_notification';
    description = 'Send email notification with build information';

    async execute(input: string): Promise<ToolResult> {
        try {
            const { recipients, subject, message, severity = 'info' } = JSON.parse(input);

            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                throw new Error('recipients array is required');
            }

            if (!message) {
                throw new Error('message is required');
            }

            // Build context information
            const buildId = tl.getVariable('Build.BuildId');
            const buildNumber = tl.getVariable('Build.BuildNumber');
            const project = tl.getVariable('System.TeamProject');
            const sourceBranch = tl.getVariable('Build.SourceBranch');
            const requestedFor = tl.getVariable('Build.RequestedFor');

            // Create email subject if not provided
            const emailSubject =
                subject || `[${project}] Build ${buildNumber} - ${severity.toUpperCase()}`;

            // Create HTML email body with build context
            const emailBody = `
                <h2>Azure DevOps Pipeline Notification</h2>
                <p><strong>Message:</strong> ${message}</p>
                <hr>
                <h3>Build Information</h3>
                <ul>
                    <li><strong>Project:</strong> ${project}</li>
                    <li><strong>Build Number:</strong> ${buildNumber}</li>
                    <li><strong>Build ID:</strong> ${buildId}</li>
                    <li><strong>Source Branch:</strong> ${sourceBranch}</li>
                    <li><strong>Requested For:</strong> ${requestedFor}</li>
                    <li><strong>Severity:</strong> ${severity.toUpperCase()}</li>
                    <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                </ul>
            `;

            // Send email notification
            const emailResult = await NotificationClient.sendEmailNotification(
                recipients,
                emailSubject,
                emailBody
            );

            console.log(`EMAIL NOTIFICATION [${severity.toUpperCase()}]: ${message}`);
            console.log(`Recipients: ${recipients.join(', ')}`);
            console.log(`Build: ${buildNumber} (${buildId})`);

            return {
                name: this.name,
                result: {
                    message,
                    severity,
                    recipients,
                    subject: emailSubject,
                    timestamp: new Date().toISOString(),
                    buildId,
                    buildNumber,
                    project,
                    emailResult,
                },
                success: true,
            };
        } catch (error) {
            return {
                name: this.name,
                result: null,
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
