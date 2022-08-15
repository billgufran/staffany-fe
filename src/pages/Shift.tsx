import React, { FunctionComponent, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
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
  weekSelectorBtn: {
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "3px",
  },
  publishedDate: {
    color: theme.color.turqouise,
    fontWeight: 300,
  },
  tableHeaderActionsContiner: {
    display: "flex",
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

// const TableHeaderActions = () => {
//   const classes = useStyles();

//   return (
//     <div>
//       {currentWeek?.publishedAt ? (
//         <Typography color="inherit" className={classes.publishedDate}>
//           Week published on{" "}
//           {format(new Date(currentWeek.publishedAt), "dd LLL yyyy, hh:mm aa")}
//         </Typography>
//       ) : null}
//       <Button
//         className={classes.addBtn}
//         variant="outlined"
//         component={RouterLink}
//         to="/shift/add"
//         disabled={currentWeek?.isPublished}
//       >
//         Add Shift
//       </Button>
//       <Button
//         className={classes.publishBtn}
//         variant="contained"
//         onClick={onPublishWeek}
//         disabled={currentWeek?.isPublished || rows.length === 0}
//       >
//         Publish
//       </Button>
//     </div>
//   );
// };

interface Week {
  id: string;
  isPublished?: boolean;
  publishedAt?: string;
}

const Shift = () => {
  const classes = useStyles();

  const [rows, setRows] = useState([]);
  const [currentWeek, setCurrentWeek] = useState<Week>({
    id: parseDate().weekNumber.toString(),
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

  const WeekSelector = (
    <>
      <IconButton
        className={classes.weekSelectorBtn}
        aria-label="previous week"
        onClick={() => {
          setCurrentWeek((prev) => ({
            ...prev,
            id: (parseInt(prev.id) - 1).toString(),
          }));
        }}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <Typography variant="h6" component="h6">
        {currentWeek?.id}
      </Typography>
      <IconButton
        className={classes.weekSelectorBtn}
        aria-label="next week"
        onClick={() => {
          setCurrentWeek((prev) => ({
            ...prev,
            id: (parseInt(prev.id) + 1).toString(),
          }));
        }}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : null}
            <DataTable
              title={WeekSelector}
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
              actions={[
                ...(currentWeek?.publishedAt
                  ? [
                      <Typography
                        color="inherit"
                        className={classes.publishedDate}
                      >
                        Week published on{" "}
                        {format(
                          new Date(currentWeek.publishedAt),
                          "dd LLL yyyy, hh:mm aa"
                        )}
                      </Typography>,
                    ]
                  : []),
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
                  onClick={onPublishWeek}
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
