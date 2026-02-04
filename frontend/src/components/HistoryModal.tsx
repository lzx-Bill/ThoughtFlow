import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  chakra,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHistory, FaArrowRight } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';
import type { EditHistoryItem } from '../types';

const MotionBox = chakra(motion.div);

export function HistoryModal() {
  const { historyModalData, setHistoryModalData } = useCardStore();

  const handleClose = () => {
    setHistoryModalData(null);
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染变更项
  const renderChangeItem = (
    label: string,
    oldValue: string | object,
    newValue: string | object
  ) => {
    const oldStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue;
    const newStr = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;

    return (
      <Box mb={3}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
          {label}
        </Text>
        <HStack
          align="flex-start"
          spacing={2}
          flexWrap="wrap"
          bg="gray.50"
          p={2}
          borderRadius="8px"
        >
          <Box
            flex={1}
            p={2}
            bg="red.50"
            borderRadius="8px"
            borderLeft="3px solid"
            borderColor="red.300"
            minW="120px"
          >
            <Text fontSize="xs" color="red.500" fontWeight="medium" mb={1}>
              修改前
            </Text>
            <Text fontSize="sm" color="gray.700" wordBreak="break-word">
              {oldStr || '(空)'}
            </Text>
          </Box>
          <Box alignSelf="center" color="gray.400">
            <FaArrowRight />
          </Box>
          <Box
            flex={1}
            p={2}
            bg="green.50"
            borderRadius="8px"
            borderLeft="3px solid"
            borderColor="green.300"
            minW="120px"
          >
            <Text fontSize="xs" color="green.500" fontWeight="medium" mb={1}>
              修改后
            </Text>
            <Text fontSize="sm" color="gray.700" wordBreak="break-word">
              {newStr || '(空)'}
            </Text>
          </Box>
        </HStack>
      </Box>
    );
  };

  // 渲染单条历史记录
  const renderHistoryItem = (item: EditHistoryItem, index: number) => {
    const { change_content } = item;

    return (
      <AccordionItem
        key={item.history_id}
        border="none"
        mb={2}
      >
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <AccordionButton
            bg="white"
            borderRadius="12px"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
            _hover={{ bg: 'gray.50' }}
            _expanded={{ bg: 'blue.50', borderBottomRadius: 0 }}
          >
            <HStack flex={1} spacing={3}>
              <Box color="blue.500">
                <FaHistory />
              </Box>
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  {formatTime(item.edit_time)}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="purple" fontSize="xs" borderRadius="full">
                    {item.operator}
                  </Badge>
                  {item.edit_note && (
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {item.edit_note}
                    </Text>
                  )}
                </HStack>
              </VStack>
            </HStack>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel
            bg="white"
            borderBottomRadius="12px"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
            mt="-1px"
          >
            <VStack align="stretch" spacing={2}>
              {change_content.title && (
                renderChangeItem('标题', change_content.title.old, change_content.title.new)
              )}
              {change_content.content && (
                renderChangeItem('内容', change_content.content.old, change_content.content.new)
              )}
              {change_content.card_style && (
                renderChangeItem(
                  '样式',
                  change_content.card_style.old,
                  change_content.card_style.new
                )
              )}
            </VStack>
          </AccordionPanel>
        </MotionBox>
      </AccordionItem>
    );
  };

  return (
    <Modal
      isOpen={!!historyModalData}
      onClose={handleClose}
      isCentered
      motionPreset="slideInRight"
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="24px"
        bg="gray.50"
        boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
        mx={4}
        maxH="80vh"
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="bold"
          color="gray.700"
          pb={2}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <FaHistory />
              <Text>编辑历史</Text>
            </HStack>
            {historyModalData && (
              <Text fontSize="sm" fontWeight="normal" color="gray.500">
                「{historyModalData.card_title}」共 {historyModalData.total_edits} 次编辑
              </Text>
            )}
          </VStack>
        </ModalHeader>
        <ModalCloseButton borderRadius="full" />

        <Divider />

        <ModalBody py={4}>
          {historyModalData && historyModalData.history.length > 0 ? (
            <Accordion allowMultiple>
              {historyModalData.history.map((item, index) => 
                renderHistoryItem(item, index)
              )}
            </Accordion>
          ) : (
            <VStack py={8} spacing={4}>
              <Text fontSize="4xl">📝</Text>
              <Text color="gray.500">暂无编辑历史</Text>
              <Text fontSize="sm" color="gray.400">
                对卡片进行修改后，历史记录将在此显示
              </Text>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
