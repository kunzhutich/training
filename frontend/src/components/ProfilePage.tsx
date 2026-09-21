import { useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import ProfileSection from "./profile/ProfileSection";
import SecuritySection from "./profile/SecuritySection";
import AccountSettingsSection from "./profile/AccountSettingsSection";

type SectionKey = "profile" | "security" | "accounts";

export default function ProfilePage() {
  const [section, setSection] = useState<SectionKey>("profile");

  const sections: Record<SectionKey, ReactNode> = {
    profile: <ProfileSection />,
    security: <SecuritySection />,
    accounts: <AccountSettingsSection />,
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Profile
      </Typography>

      <Box sx={{ display: "flex", gap: 4 }}>
        <Tabs
          orientation="vertical"
          value={section}
          onChange={(_, value: SectionKey) => setSection(value)}
          sx={{ borderRight: 1, borderColor: "divider", minWidth: 180 }}
        >
          <Tab label="Profile" value="profile" sx={{ alignItems: "flex-start" }} />
          <Tab label="Security" value="security" sx={{ alignItems: "flex-start" }} />
          <Tab label="Account Settings" value="accounts" sx={{ alignItems: "flex-start" }} />
        </Tabs>

        <Box sx={{ flex: 1, minWidth: 0 }}>{sections[section]}</Box>
      </Box>
    </Box>
  );
}
