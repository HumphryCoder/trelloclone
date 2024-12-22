import './management.css';

import { useEffect, useState, useRef } from 'react';
import Header from './header';
import { Navigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios'
import { motion, useAnimation, AnimatePresence } from "framer-motion"


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



const reorder = (list, startIndex, endIndex) => {
  if (!Array.isArray(list)) {
    console.error('Invalid list for reorder:', list);
    return [];
  }

  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


/**
 * Moves an item from one list to another list.
 */
const move = (sourceItems, destItems, droppableSource, droppableDestination) => {
  if (!sourceItems || !destItems) {
    console.error('Source or destination is invalid:', { sourceItems, destItems });
    return { [droppableSource.droppableId]: [], [droppableDestination.droppableId]: [] };
  }

  const sourceClone = Array.from(sourceItems);
  const destClone = Array.from(destItems);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;





function Management() {
  const [newItemName, setNewItemName] = useState('');
  const [editedItemId, setEditedItemId] = useState(null);


  const [state, setState] = useState([]); // Proper initialization
  const [items, setItems] = useState([]); // Define setItems


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



  useEffect(() => {
    fetchBoards();

    document.body.classList.add('management-page');
    return () => {
      document.body.classList.remove('management-page');
    };
  }, [userId]);


  const handleNewItem = async () => {
    const limit = 15;
    console.log(state.length)

    const totalItems = state.reduce((count, group) => count + (group.items ? group.items.length : 0), 0);

    console.log(totalItems); 

    
    if (totalItems < limit && selectedBoard) {
      const newItem = {
        index: totalItems + 1,  
        title: newItemName || `Item ${totalItems + 1}`,  
        board_id: selectedBoard,
        user_id: userId,
        group_index: 0, 
      };

      try {
       
        const response = await axios.post('http://127.0.0.1:5000/api/newItem', newItem);

        console.log(response.data.message);
        console.log("New Item:", response.data.newItem); 

        
        await fetchItems(selectedBoard);

        setNewItemName('');

      } catch (error) {
        console.error('Error creating item:', error);
      }
    } else {
      console.error('Error creating item: No board selected or item limit reached');
    }
  };



  const handleNewGroup = async () => {
    console.log("State length", state.length);

 
    const newGroup = {
      title: 'New Group',  
      items: [],           
    };

    try {

      const groupIndex = state.length;
     
      const response = await axios.post('http://127.0.0.1:5000/api/newGroup', {
        user_id: userId,
        board_id: selectedBoard,
        title: newGroup.title,
        group_index: groupIndex,
      });

      console.log(response.data.message); 

      const createdGroup = {
        ...newGroup,
        id: response.data.group_id,  
        group_index: groupIndex,
      };

      console.log('New Group:', createdGroup);

   
      setState((prevState) => {
      
        return [...prevState, createdGroup]; 
      });

    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const fetchItems = async (boardId) => {
    console.log('Fetching groups and items...');
    console.log('userId:', userId, 'boardId:', boardId);
  
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/loadItem', {
        params: {
          user_id: userId,
          board_id: boardId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const groupsData = response.data.groups; 
      console.log('Fetched Groups and Items:', groupsData);
  
    
      const updatedState = groupsData.map((group) => {
        const matchingItems = group.items || []; 
  
        
        const sortedItems = matchingItems.sort((a, b) => a.item_index - b.item_index);
  
        return {
          ...group,
          items: sortedItems, 
        };
      });
  
      setState(updatedState); 
    } catch (error) {
      console.error('Error fetching groups and items:', error);
      setState([]); 
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
    setSelectedBoardTitle(boardTitle);
    console.log(selectedBoard);
    await fetchItems(boardId);
  };

  const handleNewBoard = async () => {
    const limit = 15;
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

  const handleItemNameChange = async (itemId, newTitle) => {
    try {
      
      setState((prevState) => {
        const updatedState = prevState.map((group) => {
          const updatedItems = group.items.map((item) =>
            item.id === itemId ? { ...item, title: newTitle } : item
          );
          return { ...group, items: updatedItems };
        });
        return updatedState;
      });

     
      const response = await axios.post(
        'http://127.0.0.1:5000/api/fetchNewName',
        {
          user_id: userId,
          title: newTitle,
          id: itemId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error updating item name:', error);
    }
  };

  const handleItemDescriptionChange = async (itemId, newDescription) => {
    try {
     
      setState((prevState) => {
        const updatedState = prevState.map((group) => {
          const updatedItems = group.items.map((item) =>
            item.id === itemId ? { ...item, description: newDescription } : item
          );
          return { ...group, items: updatedItems };
        });
        return updatedState;
      });

     
      const response = await axios.post(
        'http://127.0.0.1:5000/api/editDescription',
        {
          user_id: userId,
          description: newDescription,
          id: itemId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error updating item description:', error);
    }
  };

  const handleBlur = (itemId, newName) => {
    if (editedItemId === itemId) {
      handleItemNameChange(itemId, newName);
      setEditedItemId(null);
    }
  };

  async function onDragEnd(result) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

   
    if (!state[sInd] || !state[sInd].items || !state[dInd] || !state[dInd].items) {
      console.error('Invalid state or droppable indices:', { sInd, dInd, state });
      return;
    }

    if (sInd === dInd) {
   
      const items = reorder(state[sInd].items, source.index, destination.index);
      console.log('Reordered items:', items);  
      
      const newState = [...state];
      newState[sInd] = { ...state[sInd], items }; 
      console.log('New state after reorder:', newState); 
    
      setState(newState);
    
     
      try {
        const itemsToSave = items.map((item, index) => ({
          id: item.id,
          item_index: index, 
          groupIndex: sInd,   
        }));
        
        console.log('Items to save:', itemsToSave);  
    
        const response = await axios.post(
          'http://127.0.0.1:5000/api/saveItemindex',
          {
            user_id: userId,
            items: itemsToSave,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Save response:', response.data); 
      } catch (error) {
        console.error('Error saving task order and status:', error);
      }

    } else {
      
      const movedItems = move(state[sInd].items, state[dInd].items, source, destination);
      const newState = [...state];
      newState[sInd] = { ...state[sInd], items: movedItems[sInd] };
      newState[dInd] = { ...state[dInd], items: movedItems[dInd] };

      setState(newState);

     
      try {
        const itemsToSave = newState.flatMap((group, sInd) =>
          group.items.map((item, index) => ({
            id: item.id,
            item_index: index, 
            groupIndex: sInd, 
          }))
        );

        console.log('Items to save:', itemsToSave);

        const response = await axios.post(
          'http://127.0.0.1:5000/api/saveItemindex',
          {
            user_id: userId,
            items: itemsToSave,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Save response:', response.data);
      } catch (error) {
        console.error('Error saving task order and status:', error);
      }
    }
  }

  const [editItemId, setEditItemId] = useState(null);
  const editItemRef = useRef(null);

  const [editListId, setEditListId] = useState(null);
  const editListRef = useRef(null);

  const handleEditList = (itemId) => {
    
    setEditListId(prevId => (prevId !== itemId ? itemId : null));
  };
  const handleEditItem = (itemId) => {
 
    setEditItemId((prevId) => (prevId !== itemId ? itemId : null));
    setEditListId(null); 
  };

  const handleClickOutside = (event) => {
    if (editListRef.current && !editListRef.current.contains(event.target)) {
      setEditListId(null);
    }

    if (editItemRef.current && !editItemRef.current.contains(event.target)) {
      setEditItemId(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemRemoval = async (itemId) => {
    try {
      await axios.get('http://127.0.0.1:5000/api/removeItem', {
        params: {
          user_id: userId,
          board_id: selectedBoard,
          id: itemId,
        },
      });
      setEditListId(null);
      await fetchItems(selectedBoard);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <div>
      <div className="projectbar-container">
        <div className="projectbar">
          <label className="boardTitle">{selectedBoardTitle}</label>
          <button className="newBoardButton" type="button" onClick={handleNewBoard}>
            Add Board
          </button>
        </div>
      </div>

      <div className="navbar-container">
        <div className="navbar-content">
          <label className="navbar-menu-label">Menu</label>
          <div className="content-btn">
            <button>Task board</button>
            <button>Dashboard</button>
            <button>Teams</button>
            <button>Calendar</button>
          </div>

          <label className="navbar-boards-label">Your boards</label>
          <div className="board-container">
            <div className="boardItems">
              {boards.map((board) => (
                <button
                  key={board.id}
                  className="navbarBoardsBtn"
                  type="button"
                  onClick={() => {
                    handleNavbarButtonClick(board.id, board.title);
                  }}
                >
                  {board.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedBoard &&
        boards.map((board) =>
          board.id === selectedBoard ? (
            <div key={board.id} className="kanban-container">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleNewGroup();
                  }}
                >
                  Add new group
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleNewItem('new');
                  }}
                >
                  Add new item
                </button>

                <div className="tab1Bg">
                  <DragDropContext onDragEnd={onDragEnd}>
                    {state.length > 0 ? (
                      state.map((group, groupIndex) => (
                        <Droppable key={`group-${group.id}`} droppableId={`${groupIndex}`}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{ marginRight: '100px', minWidth: '340px' }}
                            >
                              {group.items && group.items.length > 0 ? (
                                group.items.map((item, itemIndex) => (
                                  <Draggable key={item.id} draggableId={item.id.toString()} index={itemIndex}>
                                    {(provided) => (
                                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <div className="taskContent">
                                          <div className="taskTitle">{item.title}</div>
                                          <div className="taskButtons">
                                            <button className="editTaskBtn"
                                             onClick={() => handleEditList(item.id)}>
                                            </button>
                                            
                                            <AnimatePresence>
                                              {editListId === item.id && (
                                                <motion.div
                                                  className="editList"
                                                  ref={editListRef}
                                                  initial={{ opacity: 0, scale: 0.95 }}
                                                  animate={{ opacity: 1, scale: 1 }}
                                                  exit={{ opacity: 0, scale: 0.95 }}
                                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                  <button
                                                    className="editMenubtn"
                                                    onClick={() => handleEditItem(item.id)}
                                                  >
                                                    Edit task
                                                  </button>
                                                  <button
                                                    className="deleteTaskbtn"
                                                    onClick={() => handleItemRemoval(item.id)}
                                                  >
                                                    Delete task
                                                  </button>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>

                                            <AnimatePresence>
                                              {editItemId === item.id && (
                                                <motion.div
                                                  className="editTask"
                                                  ref={editItemRef}
                                                  initial={{ opacity: 0, scale: 0.95 }}
                                                  animate={{ opacity: 1, scale: 1 }}
                                                  exit={{ opacity: 0, scale: 0.95 }}
                                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                  <input
                                                    className="editTaskTitle"
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                                                    onBlur={() => handleItemNameChange(item.id, item.title)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                      }
                                                    }}
                                                  />
                                                  <div className="editChoice">
                                                    <label>Priority</label>
                                                    <label>Deadline</label>
                                                    <label>Estimated time</label>
                                                  </div>
                                                  <label className="editDescription">Description</label>
                                                  <textarea
                                                    className="editTaskDescription"
                                                    placeholder="Type here"
                                                    value={item.description || ""} 
                                                    onChange={(e) => handleItemDescriptionChange(item.id, e.target.value)}
                                                  />
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : null}
                              {provided.placeholder} 
                            </div>
                          )}
                        </Droppable>
                      ))
                    ) : null}
                  </DragDropContext>
                </div>
              </div>
            </div>
          ) : null
        )}
    </div>
  );
}
export default Management;
