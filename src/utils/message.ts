import { defineExtensionMessaging } from "@webext-core/messaging";

interface ProtocolMap {
  openOptionsPage(): void;
  getShowPageTranslation(): string | null;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
