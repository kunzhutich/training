import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

const SCORE = 742;
const SCORE_MAX = 850;
const SCORE_MIN = 300;

export default function CreditJourneyBlock() {
  const percent = ((SCORE - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Credit Journey
      </Typography>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={110}
            thickness={4}
            sx={{ color: "action.hover", position: "absolute" }}
          />
          <CircularProgress variant="determinate" value={percent} size={110} thickness={4} color="success" />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {SCORE}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Good
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" align="center">
          Sample score — updated monthly
        </Typography>
        <Tooltip title="Coming soon">
          <span>
            <Button size="small" disabled sx={{ cursor: "not-allowed" }}>
              View Full Report
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
