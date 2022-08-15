import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import WorkRoundedIcon from '@material-ui/icons/WorkRounded';
import { Link as RouterLink } from "react-router-dom";

export const mainListItems = (
  <div>
    <ListItem button component={RouterLink} to="/shift">
      <ListItemIcon>
        <WorkRoundedIcon />
      </ListItemIcon>
      <ListItemText primary="Shift" />
    </ListItem>
  </div>
);
