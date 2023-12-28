import { Response } from "express";
import { UserRequest } from "../shared/types";
import fs from "fs";
import moment from "moment/moment";
import config from "config";
import axios from "axios";
import path from "path/posix";
export const formartError = (errors: any) => {
  return {
    status: 0,
    errors: {},
  };
};

export function generateOTP(length = 5) {
  var string = "0123456789";
  let OTP = "";
  var len = string.length;
  for (let i = 0; i < length; i++) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}
export function generateExpiryTime(minutes = 5) {
  return moment().add(minutes, "minute");
}

const deleteUploadedFile = async (filePath: string) => {
  /**
   * Delete newly uploaded file when file has not changed preventing file dublication
   */

  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.log("Error deleting file:", error);
        reject(false);
      } else {
        console.log("File deleted successfully:", filePath);
        resolve(true);
      }
    });
  });
};

export const getUpdateFileAsync = async (
  req: UserRequest,
  dst: string,
  currImage: string | undefined
) => {
  if (req.file) {
    const originalImage = path.join(dst, req.file.originalname);
    // if file is not updated then return original else return new
    if (originalImage === currImage) {
      // Delete new upload and return the old
      await deleteUploadedFile(req.file.path);
      return originalImage;
    }
    // In future you can delete old
    return path.join(dst, req.file.filename);
  }
};

export function parseMessage(object: any, template: string) {
  // regular expression to match placeholders like {{field}}
  const placeholderRegex = /{{(.*?)}}/g;

  // Use a replace function to replace placeholders with corresponding values
  const parsedMessage = template.replace(
    placeholderRegex,
    (match, fieldName) => {
      // The fieldName variable contains the field name inside the placeholder
      // Check if the field exists in the event object
      if (object.hasOwnProperty(fieldName)) {
        return object[fieldName]; // Replace with the field's value
      } else {
        // Placeholder not found in event, leave it unchanged
        return match;
      }
    }
  );

  return parsedMessage;
}
export const sendSms = async (message: string, phone: string) => {
  const url: string = config.get("sms_url");
  const apiKey: string = config.get("sms_api_key");
  const shortCode = config.get("short_code");

  const headers = {
    Accept: "application/json",
    "api-token": apiKey,
    "Content-Type": "application/json",
  };

  const data = {
    destination: phone,
    msg: message,
    sender_id: phone,
    gateway: shortCode,
  };

  try {
    await axios.post(url, data, { headers });
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

export function isValidURL(url: string): boolean {
  try {
    // Attempt to create a URL object
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export const registry = (
  registryBaseUrl: string,
  serviceName: string,
  serviceVersion: string,
  servicePort: number
) => ({
  register: async () => {
    try {
      await axios.put(
        `${registryBaseUrl}/register/${serviceName}/${serviceVersion}/${servicePort}`
      );
    } catch (error) {
      console.error(error);
    }
  },
  unregister: async () => {
    try {
      const response = await axios.delete(
        `${registryBaseUrl}/register/${serviceName}/${serviceVersion}/${servicePort}`
      );
    } catch (error) {
      console.error(error);
    }
  },
});
