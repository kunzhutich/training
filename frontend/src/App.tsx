import { useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "./AuthContext";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import Dashboard from "./components/Dashboard";
import CustomersPage from "./components/CustomersPage";
import AllAccountsPage from "./components/AllAccountsPage";
import BranchesPage from "./components/BranchesPage";
import TransferPage from "./components/TransferPage";
import CustomerDashboardPage from "./components/CustomerDashboardPage";
import StatementsPage from "./components/StatementsPage";
import ProfilePage from "./components/ProfilePage";

type AdminTabKey = "dashboard" | "customers" | "accounts" | "branches" | "transfer";
type CustomerTabKey = "dashboard" | "statements" | "profile";

function TopBar({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Federal Reserve Bank
        </Typography>
        {children}
        <Typography variant="body2" sx={{ mx: 2, opacity: 0.85 }}>
          {user?.full_name}
        </Typography>
        <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
          Log out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState<AdminTabKey>("dashboard");

  const pages: Record<AdminTabKey, ReactNode> = {
    dashboard: <Dashboard />,
    customers: <CustomersPage />,
    accounts: <AllAccountsPage />,
    branches: <BranchesPage />,
    transfer: <TransferPage />,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopBar>
        <Tabs
          value={tab}
          onChange={(_, value: AdminTabKey) => setTab(value)}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Dashboard" value="dashboard" />
          <Tab label="Customers" value="customers" />
          <Tab label="Accounts" value="accounts" />
          <Tab label="Branches" value="branches" />
          <Tab label="Transfer" value="transfer" />
        </Tabs>
      </TopBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {pages[tab]}
      </Container>
    </Box>
  );
}

function CustomerDashboard() {
  const [tab, setTab] = useState<CustomerTabKey>("dashboard");
  const [statementsAccount, setStatementsAccount] = useState<string | null>(null);

  const pages: Record<CustomerTabKey, ReactNode> = {
    dashboard: (
      <CustomerDashboardPage
        onViewStatements={(accountNumber) => {
          setStatementsAccount(accountNumber);
          setTab("statements");
        }}
      />
    ),
    statements: <StatementsPage initialAccountNumber={statementsAccount} />,
    profile: <ProfilePage />,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <TopBar>
        <Tabs
          value={tab}
          onChange={(_, value: CustomerTabKey) => setTab(value)}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Dashboard" value="dashboard" />
          <Tab label="Statements" value="statements" />
          <Tab label="Profile" value="profile" />
        </Tabs>
      </TopBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {pages[tab]}
      </Container>
    </Box>
  );
}

function PublicLanding() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  return mode === "login" ? (
    <LoginPage onSwitchToSignUp={() => setMode("signup")} />
  ) : (
    <SignUpPage onSwitchToLogin={() => setMode("login")} />
  );
}

export default function App() {
  const { user } = useAuth();

  if (!user) return <PublicLanding />;
  return user.role === "ADMIN" ? <AdminDashboard /> : <CustomerDashboard />;
}
