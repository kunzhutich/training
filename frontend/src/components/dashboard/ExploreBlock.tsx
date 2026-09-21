import type { ComponentType } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HomeIcon from "@mui/icons-material/Home";
import GridViewIcon from "@mui/icons-material/GridView";

interface ExploreItem {
  label: string;
  icon: ComponentType;
}

const ITEMS: ExploreItem[] = [
  { label: "Auto Finance", icon: DirectionsCarIcon },
  { label: "Investing", icon: TrendingUpIcon },
  { label: "Mortgage & Loans", icon: HomeIcon },
  { label: "See All Offers", icon: GridViewIcon },
];

export default function ExploreBlock() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Explore
      </Typography>
      <Grid container spacing={1}>
        {ITEMS.map(({ label, icon: Icon }) => (
          <Grid key={label} size={6}>
            <Tooltip title="Coming soon" placement="top">
              <Stack spacing={0.5} sx={{ alignItems: "center", cursor: "not-allowed" }}>
                <IconButton
                  disabled
                  sx={{
                    bgcolor: "action.hover",
                    width: 48,
                    height: 48,
                    "&.Mui-disabled": { color: "primary.main" },
                  }}
                >
                  <Icon />
                </IconButton>
                <Typography variant="caption" align="center" color="text.secondary">
                  {label}
                </Typography>
              </Stack>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
