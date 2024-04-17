import './management.css';

import { useEffect, useState } from 'react';
import Header from './header';
import { Navigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios'
import { motion, useAnimation, } from "framer-motion"


const containerVariants = {
  close: {
    x: 0,
    transition: {
      type: "spring",
      damping: 25,

    },
  },
  open: {
    x: 225,
    transition: {
      type: "spring",
      damping: 20,

    },
  },
};


function Management() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [editedTaskId, setEditedTaskId] = useState(null);

  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedBoardTitle, setSelectedBoardTitle] = useState('');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [userEmail] = useState('');
  const [userId] = useState(localStorage.getItem('userId'));

  const [boardMove, setBoardMove] = useState(false);
  const boardControls = useAnimation();

  useEffect(() => {
    if (boardMove) {
      boardControls.start('open');
    } else {
      boardControls.start('close');
    }
  }, [boardMove, boardControls]);

  const handleBoardClick = () => {
    setBoardMove(!boardMove);
    console.log("opening board container");
  }


  useEffect(() => {
    fetchBoards();

    document.body.classList.add('management-page');
    return () => {
      document.body.classList.remove('management-page');
    };
  }, [userId]);


  const handleNewTask = async () => {
    const limit = 15;
    if (tasks.length < limit && selectedBoard) {
      const newTask = {
        index: tasks.length + 1,
        title: newTaskName || `Task ${tasks.length + 1}`,
        status: 'notStarted',
        board_id: selectedBoard,
        user_id: userId
      };

      try {
        const response = await axios.post('http://127.0.0.1:5000/api/newTask', newTask);

        console.log(response.data.message);
        console.log("New Task:", newTask);

        await fetchTasks(selectedBoard);
        setNewTaskName('');
        console.log("fetching2")
      } catch (error) {
        console.error('Error creating task:', error);
      }
    } else {
      console.error('Error creating task: No board selected or task limit reached');
    }
  };

  const fetchTasks = async (boardId) => {
    console.log("fetching")
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/loadTask', {
        params: {
          user_id: userId,
          board_id: boardId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });


      const tasksData = Array.isArray(response.data.task) ? response.data.task : [response.data.task];
      setTasks(tasksData);
      const sortedTasks = tasksData.sort((a, b) => a.task_index - b.task_index);
      setTasks(sortedTasks);
      console.log(response.data);

    } catch (error) {
      setTasks([]);
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchBoards = async () => {
    console.log("fetching");
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/loadBoard', {
        params: {
          user_id: userId
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const boardsData = Array.isArray(response.data.board) ? response.data.board : [response.data.board];
      setBoards(boardsData);
      console.log(boardsData);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleNavbarButtonClick = async (boardId, boardTitle) => {
    setSelectedBoard(boardId);
    setSelectedBoardTitle(boardTitle)
    console.log(selectedBoard);
    await fetchTasks(boardId);
  };

  const handleNewBoard = async () => {
    const limit = 5;
    if (boards.length < limit) {
      const newBoard = {
        title: newBoardName || `Board ${boards.length + 1}`,
        user_id: userId
      }
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/newBoard', newBoard);

        console.log(response.data.message);
        setNewBoardName('');
        await fetchBoards();
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }

  }

  const handleTaskNameChange = async (taskId, newName) => {
    console.log("name")
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, title: newName } : task
      )
    );

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/api/fetchNewName',
        {
          user_id: userId,
          title: newName,
          id: taskId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (error) {
      console.error('Error updating task index:', error);
      console.log(updatedTasks)
    }


  };

  const handleBlur = (taskId, newName) => {
    if (editedTaskId === taskId) {
      handleTaskNameChange(taskId, newName);
      setEditedTaskId(null);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { destination, source } = result;


    const updatedTasks = Array.from(tasks);
    const [reorderedTask] = updatedTasks.splice(source.index, 1);


    const droppableIdToStatus = {
      'notStartedTasks': 'notStarted',
      'workingOnTasks': 'workingOn',
      'doneTasks': 'done'
    };

    const status = droppableIdToStatus[destination.droppableId] || 'notStarted';

    reorderedTask.status = status;
    updatedTasks.splice(destination.index, 0, reorderedTask);

    updatedTasks.forEach((task, index) => {
      task.task_index = index;
    });


    setTasks(updatedTasks);


    try {
      const response = await axios.post('http://127.0.0.1:5000/api/saveTaskindex', {
        user_id: userId,
        tasks: updatedTasks.map(task => ({
          id: task.id,
          task_index: task.task_index,
          status: task.status
        })),
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error saving task order and status:', error);
    }
  };



  return (
    <>
      <div className='projectbar-container'>
        <div className='projectbar'>
          <label className='boardTitle'>{selectedBoardTitle}</label>
          <button className='newBoardButton' type='button' onClick={handleNewBoard}>+ New</button>
        </div>
      </div>
      <div className='navbar-container'>
        <div className='navbar-content'>
          <label className='navbar-content-label'>CONTENT</label>
          <div className='content-icons'>
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="M480-120q-151 0-255.5-46.5T120-280v-400q0-66 105.5-113T480-840q149 0 254.5 47T840-680v400q0 67-104.5 113.5T480-120Zm0-479q89 0 179-25.5T760-679q-11-29-100.5-55T480-760q-91 0-178.5 25.5T200-679q14 30 101.5 55T480-599Zm0 199q42 0 81-4t74.5-11.5q35.5-7.5 67-18.5t57.5-25v-120q-26 14-57.5 25t-67 18.5Q600-528 561-524t-81 4q-42 0-82-4t-75.5-11.5Q287-543 256-554t-56-25v120q25 14 56 25t66.5 18.5Q358-408 398-404t82 4Zm0 200q46 0 93.5-7t87.5-18.5q40-11.5 67-26t32-29.5v-98q-26 14-57.5 25t-67 18.5Q600-328 561-324t-81 4q-42 0-82-4t-75.5-11.5Q287-343 256-354t-56-25v99q5 15 31.5 29t66.5 25.5q40 11.5 88 18.5t94 7Z" /></svg>
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" /></svg>
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" /></svg>
          </div>

          <div className='content-btn'>
            <button onClick={handleBoardClick}>Boards</button>
            <button>Calendar</button>
            <button>Statistics</button>
          </div>


          <div className='premium-ad'>
            <label className='premium-label'>Get Premium For More Features</label>
            <button className='premium-button'>Get premium</button>
          </div>
        </div>


      </div>

      <motion.div
        className='board-container'
        variants={containerVariants}
        animate={boardControls}
        initial="close"
      >

       <div className='boardItems'>
         {boards.map((board) => (       
          <button
            className='navbarBoardsBtn'
            type='button'
            onClick={() => {
              handleNavbarButtonClick(board.id);
              handleBoardClick();
            }}
          >
            {board.title}
          </button>
      ))}
       </div>


      </motion.div>

      {selectedBoard && (

        boards.map((board, index) => {
          if (board.id === selectedBoard) {
            return (
              <div key={index} className='kanban-container'>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="notStartedTab">
                    <Droppable droppableId='notStartedTasks'>
                      {(provided) => (
                        <div className='tab1Bg' style={{ height: `${110 + 45 * tasks.filter(task => task.status === 'notStarted').length}px` }} ref={provided.innerRef} {...provided.droppableProps}>
                          <div className='tab1Label'><p>To Do</p></div>
                          {tasks.map((task, index) => (
                            task.status === 'notStarted' && (
                              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className='tab1NewTask'
                                  >
                                    {editedTaskId === task.id ? (
                                      <input
                                        className='tab1Tasks'
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => handleTaskNameChange(task.id, e.target.value)}
                                        onBlur={() => handleBlur(task.id, task.title)}
                                      />
                                    ) : (
                                      <span className='tab1Tasks' onClick={() => setEditedTaskId(task.id)}>{task.title}</span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            )
                          ))}
                          {provided.placeholder}
                          <div className='tab1NewTask'><button type='button' onClick={handleNewTask}><span>+ New</span></button></div>
                        </div>
                      )}
                    </Droppable>
                  </div>


                  <div className="workingOnTab">
                    <Droppable droppableId='workingOnTasks'>
                      {(provided) => (
                        <div className='tab1Bg' style={{ height: `${tasks.filter(task => task.status === 'workingOn').length > 1 ? 110 + 40 * tasks.filter(task => task.status === 'workingOn').length : 110}px` }} ref={provided.innerRef} {...provided.droppableProps}>
                          <div className='tab2Label'><p>Working On</p></div>
                          {tasks.map((task, index) => (
                            task.status === 'workingOn' && (
                              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className='tab1NewTask'
                                  >
                                    {editedTaskId === task.id ? (
                                      <input
                                        className='tab1Tasks'
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => handleTaskNameChange(task.id, e.target.value)}
                                        onBlur={() => handleBlur(task.id, task.title)}
                                      />
                                    ) : (
                                      <span className='tab1Tasks' onClick={() => setEditedTaskId(task.id)}>{task.title}</span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            )
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>


                  <div className="Done">
                    <Droppable droppableId='doneTasks'>
                      {(provided) => (
                        <div className='tab1Bg' style={{ height: `${tasks.filter(task => task.status === 'done').length > 1 ? 110 + 40 * tasks.filter(task => task.status === 'done').length : 110}px` }} ref={provided.innerRef} {...provided.droppableProps}>
                          <div className='tab3Label'><p>Done</p></div>
                          {tasks.map((task, index) => (
                            task.status === 'done' && (
                              <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className='tab1NewTask'
                                  >
                                    {editedTaskId === task.id ? (
                                      <input
                                        className='tab1Tasks'
                                        type="text"
                                        value={task.title}
                                        onChange={(e) => handleTaskNameChange(task.id, e.target.value)}
                                        onBlur={() => handleBlur(task.id, task.title)}
                                      />
                                    ) : (
                                      <span className='tab1Tasks' onClick={() => setEditedTaskId(task.id)}>{task.title}</span>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            )
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                </DragDropContext>
              </div>
            );
          }
          return null;

        })

      )}
    </>
  );
}

export default Management;
