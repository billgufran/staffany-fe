import React, { FunctionComponent, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmDialog from "../components/ConfirmDialog";
import WeekSelector from "../components/WeekSelector";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink, useHistory } from "react-router-dom";
import {
  Button,
  Typography,
  IconButton,
  CardContent,
  Card,
  Grid,
} from "@material-ui/core";
import { parseDate } from "../helper/utils";
import { getWeekById, publishWeek } from "../helper/api/week";
import { format } from "date-fns";
import { useQueryParam } from "../helper/hooks";

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
  publishedDate: {
    color: theme.color.turqouise,
    fontWeight: 300,
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

interface TableHeaderActionsProps {
  onPublish: () => void;
  publishedDate?: string;
  isPublishDisabled?: boolean;
  isAddDisabled?: boolean;
}

const TableHeaderActions: FunctionComponent<TableHeaderActionsProps> = ({
  onPublish,
  publishedDate,
  isPublishDisabled,
  isAddDisabled,
}) => {
  const classes = useStyles();

  return (
    <>
      {publishedDate && (
        <Typography color="inherit" className={classes.publishedDate}>
          Week published on{" "}
          {format(new Date(publishedDate), "dd LLL yyyy, hh:mm aa")}
        </Typography>
      )}
      <Button
        className={classes.addBtn}
        variant="outlined"
        component={RouterLink}
        to="/shift/add"
        disabled={isAddDisabled}
      >
        Add Shift
      </Button>
      <Button
        className={classes.publishBtn}
        variant="contained"
        onClick={onPublish}
        disabled={isPublishDisabled}
      >
        Publish
      </Button>
    </>
  );
};

interface Week {
  id: string;
  isPublished?: boolean;
  publishedAt?: string;
}

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();
  const queryParam = useQueryParam();

  const [rows, setRows] = useState([]);
  const [currentWeek, setCurrentWeek] = useState<Week>({
    id: queryParam.get("week") || parseDate().UTCWeekNumber.toString(),
    isPublished: undefined,
    publishedAt: undefined,
  });
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

  const onPublishWeek = async () => {
    try {
      setIsLoading(true);
      setErrMsg("");
      const { results } = await publishWeek({
        id: currentWeek!.id,
        isPublished: true,
        publishedAt: new Date().toISOString(),
      });
      setCurrentWeek(
        (prev) =>
          ({
            ...prev,
            isPublished: results.isPublished,
            publishedAt: results.publishedAt,
          } as Week)
      );
      setRows(results.shifts);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getData = async (weekId: string) => {
    setIsLoading(true);
    setErrMsg("");

    try {
      const { results } = await getWeekById(weekId);
      setCurrentWeek((prev) => ({
        ...prev,
        id: weekId,
        isPublished: results?.isPublished,
        publishedAt: results?.publishedAt,
      }));
      setRows(results?.shifts ?? []);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    getData(currentWeek!.id);
  }, [currentWeek.id]);

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 && <Alert severity="error">{errMsg}</Alert>}
            <DataTable
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
              customStyles={{
                header: {
                  style: {
                    "& > div:nth-child(-n+2)": {
                      display: "flex",
                      gap: "7px",
                    },
                  },
                },
              }}
              title={
                <WeekSelector
                  weekNumber={currentWeek.id}
                  isWeekPublished={currentWeek?.isPublished}
                  onButtonClick={(updatedWeekNumber) => {
                    history.push(`/shift?week=${updatedWeekNumber}`);
                    setCurrentWeek((prev) => ({
                      ...prev,
                      isPublished: false,
                      publishedAt: undefined,
                      id: updatedWeekNumber,
                    }));
                  }}
                />
              }
              actions={
                <TableHeaderActions
                  onPublish={onPublishWeek}
                  publishedDate={currentWeek?.publishedAt}
                  isAddDisabled={currentWeek?.isPublished || isLoading}
                  isPublishDisabled={
                    currentWeek?.isPublished || isLoading || rows.length === 0
                  }
                />
              }
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
