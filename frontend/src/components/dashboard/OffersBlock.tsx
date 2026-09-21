import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import CreditCardIcon from "@mui/icons-material/CreditCard";

interface PlaceholderCard {
  name: string;
  blurb: string;
  gradient: string;
}

const CARDS: PlaceholderCard[] = [
  {
    name: "Everyday Rewards Card",
    blurb: "Earn points by simply BREATHING",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #3b6ea5 100%)",
  },
  {
    name: "Cash Back Card",
    blurb: "Get 9999% CASH BACK on ALL purchases",
    gradient: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
  },
];

export default function OffersBlock() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Offers for You
      </Typography>
      <Stack spacing={2}>
        {CARDS.map((card) => (
          <Tooltip key={card.name} title="Under development" placement="top">
            <Box
              sx={{
                borderRadius: 2,
                p: 2,
                color: "common.white",
                background: card.gradient,
                cursor: "not-allowed",
                userSelect: "none",
                aspectRatio: "1.6 / 1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <CreditCardIcon sx={{ opacity: 0.85 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {card.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {card.blurb}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Stack>
    </Paper>
  );
}
