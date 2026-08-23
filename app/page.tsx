"use client";

import TopBar from "@/components/TopBar";
import ChatPane from "@/components/ChatPane";
import AuthScreen from "@/components/AuthScreen";
import SetupCheckoutPrompt from "@/components/SetupCheckoutPrompt";
import { useAgentChat } from "@/lib/useAgentChat";
import { useAuth } from "@/lib/useAuth";
import { useProfiles } from "@/lib/useProfiles";
import { useMoneiConnection } from "@/lib/useMoneiConnection";
import { useState } from "react";

export default function Home() {
  const auth = useAuth();
  const profiles = useProfiles(auth.token);
  const monei = useMoneiConnection(auth.token);
  const [setupDismissed, setSetupDismissed] = useState(false);

  const {
    timeline,
    isStreaming,
    awaitingFirstResponse,
    sendMessage,
    resolveConfirmPrompt,
    markTransferPaid,
  } = useAgentChat(auth.token, auth.logout);

  const handleConfirm = (id: string) => {
    resolveConfirmPrompt(id);
    sendMessage("Yes, please place the order.");
  };

  const handleDecline = (id: string) => {
    resolveConfirmPrompt(id);
  };

  if (auth.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-[13px] text-ink-faint">Loading…</p>
      </div>
    );
  }

  if (!auth.user) {
    return <AuthScreen onLogin={auth.login} onRegister={auth.register} />;
  }

  const showSetupPrompt =
    !profiles.loading && profiles.profiles.length === 0 && !setupDismissed;

  return (
    <div className="flex h-screen flex-col bg-bg">
      <TopBar user={auth.user} />
      <ChatPane
        timeline={timeline}
        isStreaming={isStreaming}
        awaitingFirstResponse={awaitingFirstResponse}
        token={auth.token}
        moneiConnected={monei.status.connected}
        onSend={sendMessage}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
        onTransferPaid={markTransferPaid}
        onConnectMonei={() => monei.connect()}
      />
      {showSetupPrompt && (
        <SetupCheckoutPrompt
          onSave={async (input) => {
            await profiles.create(input);
            setSetupDismissed(true);
          }}
          onSkip={() => setSetupDismissed(true)}
        />
      )}
    </div>
  );
}