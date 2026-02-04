import { useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  HStack,
  VStack,
  Button,
  Tooltip,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaHistory } from 'react-icons/fa';
import type { IdeaCard } from '../types';
import { useCardStore } from '../stores/cardStore';

const MotionBox = chakra(motion.div);

interface IdeaCardItemProps {
  card: IdeaCard;
  isDeleted?: boolean;
}

export function IdeaCardItem({ card, isDeleted = false }: IdeaCardItemProps) {
  const toast = useToast();
  const {
    setEditModalCard,
    setEditModalOpen,
    setDeleteConfirmCardId,
    fetchHistory,
    recoverCard,
    isLoading,
  } = useCardStore();

  const [isHovered, setIsHovered] = useState(false);

  // 获取阴影样式 - 深色背景适配
  const getShadowStyle = (shadow: string, hovered: boolean) => {
    if (hovered) {
      return '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(167, 139, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
    }
    return '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(167, 139, 250, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
  };

  // 点击卡片打开编辑Modal
  const handleCardClick = () => {
    if (!isDeleted) {
      setEditModalCard(card);
      setEditModalOpen(true);
    }
  };

  // 删除按钮点击
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmCardId(card._id);
  };

  // 查看历史
  const handleHistoryClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetchHistory(card._id);
    } catch {
      toast({
        title: '获取历史失败',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // 恢复卡片
  const handleRecover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await recoverCard(card._id);
      toast({
        title: '恢复成功',
        description: '卡片已恢复到正常列表',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: '恢复失败',
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

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDeleted ? 0.6 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -4, scale: 1.02 }}
      bg={card.card_style.bg_color}
      color={card.card_style.text_color}
      borderRadius={card.card_style.border_radius}
      boxShadow={getShadowStyle(card.card_style.shadow, isHovered)}
      p={5}
      cursor={isDeleted ? 'default' : 'pointer'}
      position="relative"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      filter={isDeleted ? 'grayscale(30%)' : 'none'}
      _hover={{
        boxShadow: getShadowStyle(card.card_style.shadow, true),
      }}
    >
      {/* 操作按钮 - 悬浮时显示 */}
      <AnimatePresence>
        {isHovered && !isDeleted && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            position="absolute"
            top={2}
            right={2}
          >
            <HStack spacing={1}>
              <Tooltip label="查看历史" placement="top">
                <IconButton
                  aria-label="查看历史"
                  icon={<FaHistory />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={handleHistoryClick}
                  _hover={{ bg: 'rgba(255,255,255,0.5)' }}
                />
              </Tooltip>
              <Tooltip label="删除卡片" placement="top">
                <IconButton
                  aria-label="删除"
                  icon={<FaTrash />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={handleDeleteClick}
                  _hover={{ bg: 'rgba(255,255,255,0.5)' }}
                />
              </Tooltip>
            </HStack>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* 已删除卡片的恢复按钮 */}
      {isDeleted && (
        <Box position="absolute" top={2} right={2}>
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleRecover}
            isLoading={isLoading}
          >
            恢复
          </Button>
        </Box>
      )}

      <VStack align="stretch" spacing={3}>
        {/* 标题 */}
        <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
          {card.title}
        </Text>

        {/* 内容 */}
        <Text fontSize="sm" color={card.card_style.text_color} opacity={0.9} noOfLines={5}>
          {card.content}
        </Text>

        {/* Todo数量提示 */}
        {card.todos && card.todos.length > 0 && (
          <HStack fontSize="xs" color="gray.600">
            <Text>
              📝 {card.todos.filter(t => t.completed).length} / {card.todos.length} 已完成
            </Text>
          </HStack>
        )}

        {/* 时间信息 */}
        <HStack justify="space-between" fontSize="xs" opacity={0.6} pt={1}>
          <Text>创建: {formatTime(card.create_time)}</Text>
          {card.edit_history.length > 0 && (
            <Text>已编辑 {card.edit_history.length} 次</Text>
          )}
        </HStack>
      </VStack>
    </MotionBox>
  );
}

