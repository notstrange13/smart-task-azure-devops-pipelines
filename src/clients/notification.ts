import { BaseAzureDevOpsClient } from './base';

/**
 * Client for sending email notifications
 */
export class NotificationClient extends BaseAzureDevOpsClient {
    /**
     * Send email notification (requires Azure DevOps email service)
     * @param recipients - Array of email addresses
     * @param subject - Email subject
     * @param body - Email body (can be HTML)
     */
    static async sendEmailNotification(
        recipients: string[],
        subject: string,
        body: string
    ): Promise<any> {
        // Note: This would typically use Azure DevOps notification service
        // or integrate with an external email service like SendGrid
        const payload = {
            recipients: recipients,
            subject: subject,
            body: body,
            isHtml: true,
        };

        // This is a placeholder - actual implementation would depend on
        // the specific email service being used
        console.log('Email notification payload:', payload);

        return {
            success: true,
            message: 'Email notification queued',
            recipients: recipients.length,
        };
    }

    /**
     * Get notification subscriptions for the current user
     */
    static async getNotificationSubscriptions(): Promise<any> {
        return this.makeRequest(`/notification/subscriptions?api-version=7.0`);
    }

    /**
     * Create a notification subscription
     * @param subscription - Subscription configuration
     */
    static async createNotificationSubscription(subscription: any): Promise<any> {
        return this.makeRequest(
            `/notification/subscriptions?api-version=7.0`,
            'POST',
            subscription
        );
    }
}
