import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  IconButton,
  Text,
  Checkbox,
  Box,
  Divider,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';
import type { IdeaCard, TodoItem, UpdateCardRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

const MotionBox = chakra(motion.div);

interface EditCardModalProps {
  card: IdeaCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCardModal({ card, isOpen, onClose }: EditCardModalProps) {
  const toast = useToast();
  const { updateCard, isLoading } = useCardStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // 当卡片变化时初始化表单
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setContent(card.content);
      setTodos([...card.todos]);
      setNewTodoText('');
    }
  }, [card]);

  const handleClose = () => {
    onClose();
  };

  // 添加新待办
  const handleAddTodo = () => {
    if (!newTodoText.trim()) {
      toast({
        title: '请输入待办内容',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const now = new Date().toISOString();
    const newTodo: TodoItem = {
      todo_id: uuidv4(),
      text: newTodoText.trim(),
      completed: false,
      create_time: now,
      update_time: now,
    };

    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  // 切换待办完成状态
  const handleToggleTodo = (todoId: string) => {
    setTodos(todos.map(todo => {
      if (todo.todo_id === todoId) {
        return {
          ...todo,
          completed: !todo.completed,
          update_time: new Date().toISOString(),
        };
      }
      return todo;
    }));
  };

  // 更新待办文本
  const handleUpdateTodoText = (todoId: string, newText: string) => {
    setTodos(todos.map(todo => {
      if (todo.todo_id === todoId) {
        return {
          ...todo,
          text: newText,
          update_time: new Date().toISOString(),
        };
      }
      return todo;
    }));
  };

  // 删除待办
  const handleDeleteTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.todo_id !== todoId));
  };

  // 保存修改
  const handleSave = async () => {
    if (!card) return;

    if (!title.trim()) {
      toast({
        title: '请输入标题',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: '请输入内容',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const updateData: UpdateCardRequest = {
      title: title.trim(),
      content: content.trim(),
      card_style: card.card_style,
      todos: todos,
      old_title: card.title,
      old_content: card.content,
      old_card_style: card.card_style,
      old_todos: card.todos,
      operator: 'anonymous',
    };

    try {
      await updateCard(card._id, updateData);
      toast({
        title: '保存成功',
        description: '卡片内容已更新',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      handleClose();
    } catch {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!card) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      motionPreset="slideInBottom"
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="24px"
        bg="white"
        boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
        mx={4}
        maxH="90vh"
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="bold"
          color="gray.700"
          pb={2}
        >
          ✏️ 编辑卡片
        </ModalHeader>
        <ModalCloseButton borderRadius="full" />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 标题输入 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                标题
              </FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="卡片标题..."
                borderRadius="12px"
                borderColor="gray.200"
                color="gray.800"
                _placeholder={{ color: 'gray.400' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                maxLength={100}
              />
            </FormControl>

            {/* 内容输入 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                内容
              </FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="详细内容..."
                borderRadius="12px"
                borderColor="gray.200"
                color="gray.800"
                _placeholder={{ color: 'gray.400' }}
                minH="120px"
                resize="vertical"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                maxLength={2000}
              />
            </FormControl>

            <Divider />

            {/* 待办事项列表 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                📝 待办事项
              </FormLabel>
              
              <VStack spacing={2} align="stretch" mb={3}>
                {todos.map((todo) => (
                  <MotionBox
                    key={todo.todo_id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <HStack
                      p={3}
                      bg={todo.completed ? 'gray.50' : 'white'}
                      borderRadius="12px"
                      border="1px solid"
                      borderColor="gray.200"
                      spacing={3}
                    >
                      {/* 完成勾选框 */}
                      <Checkbox
                        isChecked={todo.completed}
                        onChange={() => handleToggleTodo(todo.todo_id)}
                        colorScheme="green"
                        size="lg"
                      />

                      {/* 待办文本 */}
                      <Box flex={1}>
                        <Input
                          value={todo.text}
                          onChange={(e) => handleUpdateTodoText(todo.todo_id, e.target.value)}
                          size="sm"
                          variant="unstyled"
                          color="gray.800"
                          textDecoration={todo.completed ? 'line-through' : 'none'}
                          opacity={todo.completed ? 0.6 : 1}
                          fontWeight="medium"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          更新: {formatTime(todo.update_time)}
                        </Text>
                      </Box>

                      {/* 删除按钮 */}
                      <IconButton
                        aria-label="删除待办"
                        icon={<FaTrash />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteTodo(todo.todo_id)}
                      />
                    </HStack>
                  </MotionBox>
                ))}
              </VStack>

              {/* 添加新待办 */}
              <HStack>
                <Input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  placeholder="添加新待办..."
                  size="sm"
                  borderRadius="12px"
                  borderColor="gray.200"
                  color="gray.800"
                  _placeholder={{ color: 'gray.400' }}
                  _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                  maxLength={500}
                />
                <IconButton
                  aria-label="添加待办"
                  icon={<FaPlus />}
                  onClick={handleAddTodo}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="12px"
                />
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter pt={4}>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              onClick={handleClose}
              borderRadius="12px"
              color="gray.500"
            >
              取消
            </Button>
            <Button
              leftIcon={<FaSave />}
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isLoading}
              borderRadius="12px"
              px={6}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              保存修改
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
