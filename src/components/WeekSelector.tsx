import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import { Typography, IconButton } from "@material-ui/core";
import { parseUTCWeekNumber } from "../helper/utils";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  weekSelectorBtn: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "3px",
  },
}));

interface WeekSelectorProps {
  weekNumber: string;
  onButtonClick: (weekNumber: string) => void;
}

const WeekSelector: FunctionComponent<WeekSelectorProps> = ({
  weekNumber: _weekNumber,
  onButtonClick,
}) => {
  const classes = useStyles();
  const weekNumber = parseInt(_weekNumber);
  const { weekStartDate, weekEndDate } = parseUTCWeekNumber(weekNumber);

  return (
    <>
      <IconButton
        className={classes.weekSelectorBtn}
        aria-label="previous week"
        onClick={() => onButtonClick((weekNumber - 1).toString())}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <Typography variant="h6" component="h6">
        {format(weekStartDate, "LLL dd")} - {format(weekEndDate, "LLL dd")}
      </Typography>
      <IconButton
        className={classes.weekSelectorBtn}
        aria-label="next week"
        onClick={() => onButtonClick((weekNumber + 1).toString())}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </>
  );
};

export default WeekSelector;
