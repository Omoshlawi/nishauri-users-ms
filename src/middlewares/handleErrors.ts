import { NextFunction, Request, Response } from "express";
import { APIException } from "../shared/exceprions";
import { entries } from "lodash";

export function handleErrors(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error.status) {
    return res.status(error.status).json({
      errors: entries(error.errors).reduce((prev, [key, value]) => {
        if (key === "_errors") return { ...prev, [key]: value };
        return {
          ...prev,
          [key]: ((value as any)._errors as string[]).join(", "),
        };
      }, {}),
    });
  }
  // For other types of errors, return a generic error response
  console.log("[*]Error handler middleware: ", error.message);

  return res.status(500).json({ detail: "Internal Server Error" });
}

export default handleErrors;
