import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShifts } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@material-ui/core";
import { parseDate } from "../helper/utils";
import { getWeekById } from "../helper/api/week";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: "white",
    color: theme.color.turquoise,
  },
  publishBtn: {
    backgroundColor: theme.color.turqouise,
    color: "white",
  },
  addBtn: {
    color: theme.color.turqouise,
    borderColor: theme.color.turqouise,
  },
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  isDisabled?: boolean;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  isDisabled,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit`}
        disabled={isDisabled}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        aria-label="delete"
        onClick={() => onDelete()}
        disabled={isDisabled}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

interface Week {
  id: string;
  isPublished?: boolean;
  publishedAt?: string;
}

const Shift = () => {
  const classes = useStyles();

  const [rows, setRows] = useState([]);
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const { weekNumber } = parseDate();

    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        const { results } = await getWeekById(weekNumber.toString());
        setCurrentWeek((prev) => ({
          ...prev,
          id: results.id,
          isPublished: results.isPublished,
          publishedAt: results.publishedAt,
        }));
        setRows(results.shifts);
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton
          id={row.id}
          onDelete={() => onDeleteClick(row.id)}
          isDisabled={row.isPublished}
        />
      ),
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : null}
            <DataTable
              title={currentWeek?.id}
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
              actions={[
                <Button
                  className={classes.addBtn}
                  variant="outlined"
                  component={RouterLink}
                  to="/shift/add"
                  disabled={currentWeek?.isPublished}
                >
                  Add Shift
                </Button>,
                <Button
                  className={classes.publishBtn}
                  variant="contained"
                  onClick={() => alert("Publish")}
                  disabled={currentWeek?.isPublished || rows.length === 0}
                >
                  Publish
                </Button>,
              ]}
            />
          </CardContent>
        </Card>
      </Grid>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shift;
