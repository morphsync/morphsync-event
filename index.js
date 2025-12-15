// Import axios library for making HTTP requests
const axios = require('axios');

/**
 * @class Event
 * @description Handles the processing of events by sending notifications based on event data. 
 *              This class is responsible for preparing request data, sending HTTP requests, 
 *              and replacing dynamic placeholders with actual values from event data.
 * @version 1.0.0
 * @author Jay Chauhan
 */
class Event {
    /**
     * Creates an instance of the Event class.
     * @param {Object} event - The event object containing details for processing.
     * @param {string} event.eventRequestUrl - The API endpoint URL for sending notifications.
     * @param {string} event.eventRequestType - The HTTP method to use (e.g., 'GET', 'POST').
     * @param {Object} [event.eventRequestHeaders] - Optional headers for the HTTP request.
     * @param {Object} event.eventRequestData - The request data structure containing placeholders.
     * @param {Array<Object>} event.eventData - An array of objects containing event-specific data.
     */
    constructor(event) {
        // Store the API endpoint URL for making HTTP requests
        this.requestUrl = event.eventRequestUrl;
        
        // Store the HTTP method (GET, POST, PUT, DELETE, etc.)
        this.requestType = event.eventRequestType;
        
        // Store custom headers or initialize as empty object if not provided
        this.requestHeaders = event.eventRequestHeaders || {};
        
        // Store the request data template that contains placeholders like {{name}}
        this.eventRequestData = event.eventRequestData;
        
        // Store the array of event data objects used to replace placeholders
        this.eventData = event.eventData;
    }

    /**
     * Handles the event by sending notifications for each item in eventData.
     * @returns {Promise<Array>} - A promise that resolves with an array of responses.
     */
    async handleEvent() {
        // Array to store responses from each notification request
        const eventResponse = [];

        try {
            // Iterate over each event data item and send notifications
            for (const details of this.eventData) {
                // Prepare request data by replacing placeholders with actual data
                const dataToSend = this.#replacePlaceholders(this.eventRequestData, details);

                // Send the HTTP request using axios
                const response = await axios({
                    method: this.requestType, // HTTP method (GET, POST, etc.)
                    url: this.requestUrl, // API endpoint URL
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                        ...this.requestHeaders, // Merge any custom headers provided
                    },
                    data: dataToSend, // Send the prepared data with replaced placeholders
                });
                
                // Collect the response data from the API
                eventResponse.push(response.data);
            }
            
            // Return all collected responses
            return eventResponse;
        } catch (error) {
            // If any error occurs during the process, throw it to be handled by caller
            throw error;
        }
    }

    /**
     * Replaces placeholders in the request data with values from the event-specific data.
     * Supports nested properties using dot notation (e.g., {{user.name}}).
     * @param {Object|string} data - The request data containing placeholders (can be an object or string).
     * @param {Object} recipient - The event-specific data used to replace placeholders.
     * @returns {Object|string} - The updated request data with placeholders replaced.
     * @private
     */
    #replacePlaceholders(data, recipient) {
        /**
         * Helper function to replace placeholders in a string.
         * @param {string} str - The string containing placeholders like {{key}} or {{user.name}}
         * @param {Object} obj - The object containing values to replace placeholders
         * @returns {string} - The string with all placeholders replaced
         */
        const replaceInString = (str, obj) => {
            // Use regex to find all placeholders in format {{key}} or {{nested.key}}
            return str.replace(/{{(.*?)}}/g, (match, key) => {
                // Split the key by dots to support nested properties (e.g., user.name)
                const keys = key.split('.').map(k => k.trim());
                
                // Start with the recipient object
                let value = obj;
                
                // Traverse through nested properties
                for (const k of keys) {
                    // Check if the current level exists and has the property
                    if (value && value[k] !== undefined) {
                        value = value[k]; // Move to the next level
                    } else {
                        // If property doesn't exist, return the original placeholder
                        return match;
                    }
                }
                
                // Return the found value or the original placeholder if value is falsy
                return value || match;
            });
        };

        // If data is a string, replace placeholders directly
        if (typeof data === 'string') {
            return replaceInString(data, recipient);
        }

        // If data is an object (but not an array), recursively replace placeholders in all properties
        if (typeof data === 'object' && !Array.isArray(data)) {
            const result = {}; // Create a new object to store results
            
            // Iterate through all key-value pairs in the object
            for (const [key, value] of Object.entries(data)) {
                // Recursively replace placeholders in the value
                result[key] = this.#replacePlaceholders(value, recipient);
            }
            
            return result; // Return the new object with replaced values
        }

        // If data is an array, recursively replace placeholders in each element
        if (Array.isArray(data)) {
            return data.map(item => this.#replacePlaceholders(item, recipient));
        }

        // If data is neither string, object, nor array (e.g., number, boolean), return as is
        return data;
    }
}

// Export the Event class for use in other parts of the application
module.exports = Event;
