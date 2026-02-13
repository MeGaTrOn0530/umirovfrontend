import { api } from "@/lib/api";
import type { FileAttachment } from "@/types";

export const fileService = {
  async upload(file: File): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as FileAttachment;
  },
};
