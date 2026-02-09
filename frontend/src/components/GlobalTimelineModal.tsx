import { useState, useEffect, useCallback } from 'react';
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
  Divider,
  Input,
  Button,
  Flex,
  Icon,
  Spinner,
  chakra,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaListUl,
  FaCheckCircle,
  FaMinusCircle,
  FaClock,
  FaCalendarAlt,
  FaFilter,
  FaTimesCircle,
} from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';
import type { TimelineEvent } from '../types';

const MotionBox = chakra(motion.div);

// 事件类型配置
const EVENT_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  label: string;
  dotBg: string;
}> = {
  card_created: {
    icon: FaPlus,
    color: '#48BB78',
    gradientFrom: '#48BB78',
    gradientTo: '#38A169',
    label: '新增卡片',
    dotBg: 'linear-gradient(135deg, #48BB78, #38A169)',
  },
  card_deleted: {
    icon: FaTrashAlt,
    color: '#FC8181',
    gradientFrom: '#FC8181',
    gradientTo: '#E53E3E',
    label: '删除卡片',
    dotBg: 'linear-gradient(135deg, #FC8181, #E53E3E)',
  },
  title_changed: {
    icon: FaEdit,
    color: '#63B3ED',
    gradientFrom: '#63B3ED',
    gradientTo: '#3182CE',
    label: '标题修改',
    dotBg: 'linear-gradient(135deg, #63B3ED, #3182CE)',
  },
  todo_added: {
    icon: FaListUl,
    color: '#B794F4',
    gradientFrom: '#B794F4',
    gradientTo: '#805AD5',
    label: '新增待办',
    dotBg: 'linear-gradient(135deg, #B794F4, #805AD5)',
  },
  todo_updated: {
    icon: FaCheckCircle,
    color: '#F6AD55',
    gradientFrom: '#F6AD55',
    gradientTo: '#DD6B20',
    label: '更新待办',
    dotBg: 'linear-gradient(135deg, #F6AD55, #DD6B20)',
  },
  todo_deleted: {
    icon: FaMinusCircle,
    color: '#FC8181',
    gradientFrom: '#FC8181',
    gradientTo: '#C53030',
    label: '删除待办',
    dotBg: 'linear-gradient(135deg, #FC8181, #C53030)',
  },
};

// 格式化完整时间
const formatFullTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 获取日期标签（用于分组）
const getDateLabel = (timeStr: string) => {
  const date = new Date(timeStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '今天';
  if (date.toDateString() === yesterday.toDateString()) return '昨天';

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 按日期分组事件
function groupEventsByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const label = getDateLabel(event.event_time);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(event);
  }
  return groups;
}

export function GlobalTimelineModal() {
  const {
    isTimelineOpen,
    setTimelineOpen,
    timelineData,
    fetchTimeline,
    isLoading,
  } = useCardStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  // 打开时加载数据
  useEffect(() => {
    if (isTimelineOpen) {
      fetchTimeline();
      setStartDate('');
      setEndDate('');
      setIsFiltered(false);
    }
  }, [isTimelineOpen, fetchTimeline]);

  const handleClose = () => {
    setTimelineOpen(false);
  };

  const handleFilter = useCallback(() => {
    const start = startDate ? new Date(startDate).toISOString() : undefined;
    // 设置end为当天结束23:59:59
    let end: string | undefined;
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      end = endDateObj.toISOString();
    }
    fetchTimeline(start, end);
    setIsFiltered(!!(startDate || endDate));
  }, [startDate, endDate, fetchTimeline]);

  const handleClearFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setIsFiltered(false);
    fetchTimeline();
  }, [fetchTimeline]);

  // 快速筛选按钮
  const handleQuickFilter = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);

    const startISO = start.toISOString();
    const endObj = new Date(endStr);
    endObj.setHours(23, 59, 59, 999);
    fetchTimeline(startISO, endObj.toISOString());
    setIsFiltered(true);
  }, [fetchTimeline]);

  const events = timelineData?.events ?? [];
  const groupedEvents = groupEventsByDate(events);

  return (
    <Modal
      isOpen={isTimelineOpen}
      onClose={handleClose}
      isCentered
      motionPreset="slideInBottom"
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent
        borderRadius="24px"
        bg="linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
        boxShadow="0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)"
        mx={4}
        maxH="85vh"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        {/* Header */}
        <ModalHeader pb={2}>
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Box
                p={2}
                borderRadius="12px"
                bg="linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(167, 139, 250, 0.3))"
              >
                <Icon as={FaClock} color="purple.300" boxSize={5} />
              </Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, purple.300, pink.300)"
                bgClip="text"
              >
                全局时间线
              </Text>
            </HStack>
            {timelineData && (
              <Text fontSize="sm" color="whiteAlpha.600">
                共 {timelineData.total} 条记录
                {isFiltered && ' (已筛选)'}
              </Text>
            )}
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          borderRadius="full"
          color="whiteAlpha.600"
          _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
        />

        {/* Filter Section */}
        <Box px={6} pb={3}>
          <Box
            p={4}
            borderRadius="16px"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <HStack spacing={2} mb={3}>
              <Icon as={FaFilter} color="cyan.400" boxSize={3} />
              <Text fontSize="sm" fontWeight="medium" color="cyan.400">
                时间筛选
              </Text>
            </HStack>
            <Flex gap={3} direction={{ base: 'column', md: 'row' }} align="end">
              <Box flex={1}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>
                  开始日期
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaCalendarAlt} color="whiteAlpha.400" boxSize={3} />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="10px"
                    color="whiteAlpha.900"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px rgba(167, 139, 250, 0.4)',
                    }}
                    sx={{
                      '&::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        cursor: 'pointer',
                      },
                    }}
                  />
                </InputGroup>
              </Box>
              <Box flex={1}>
                <Text fontSize="xs" color="whiteAlpha.500" mb={1}>
                  结束日期
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaCalendarAlt} color="whiteAlpha.400" boxSize={3} />
                  </InputLeftElement>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    borderRadius="10px"
                    color="whiteAlpha.900"
                    _hover={{ borderColor: 'purple.400' }}
                    _focus={{
                      borderColor: 'purple.400',
                      boxShadow: '0 0 0 1px rgba(167, 139, 250, 0.4)',
                    }}
                    sx={{
                      '&::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        cursor: 'pointer',
                      },
                    }}
                  />
                </InputGroup>
              </Box>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={handleFilter}
                  bg="linear-gradient(135deg, #805AD5, #6B46C1)"
                  color="white"
                  borderRadius="10px"
                  _hover={{
                    bg: 'linear-gradient(135deg, #6B46C1, #553C9A)',
                    transform: 'translateY(-1px)',
                  }}
                  px={4}
                >
                  筛选
                </Button>
                {isFiltered && (
                  <Button
                    size="sm"
                    onClick={handleClearFilter}
                    variant="ghost"
                    color="whiteAlpha.700"
                    borderRadius="10px"
                    _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                    leftIcon={<FaTimesCircle />}
                  >
                    清除
                  </Button>
                )}
              </HStack>
            </Flex>

            {/* Quick filter buttons */}
            <HStack spacing={2} mt={3}>
              <Text fontSize="xs" color="whiteAlpha.400">
                快捷:
              </Text>
              {[
                { label: '今天', days: 0 },
                { label: '近3天', days: 3 },
                { label: '近7天', days: 7 },
                { label: '近30天', days: 30 },
              ].map(({ label, days }) => (
                <Button
                  key={label}
                  size="xs"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="whiteAlpha.700"
                  borderRadius="full"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    borderColor: 'purple.400',
                    color: 'purple.300',
                  }}
                  onClick={() => handleQuickFilter(days)}
                >
                  {label}
                </Button>
              ))}
            </HStack>
          </Box>
        </Box>

        <Divider borderColor="whiteAlpha.100" />

        {/* Timeline Body */}
        <ModalBody py={4} px={6}>
          {isLoading ? (
            <VStack py={10} spacing={4}>
              <Spinner color="purple.400" size="lg" thickness="3px" />
              <Text color="whiteAlpha.600" fontSize="sm">
                加载中...
              </Text>
            </VStack>
          ) : events.length === 0 ? (
            <VStack py={10} spacing={4}>
              <Text fontSize="4xl">📭</Text>
              <Text color="whiteAlpha.700" fontWeight="medium">
                暂无记录
              </Text>
              <Text color="whiteAlpha.500" fontSize="sm">
                {isFiltered ? '该时间范围内没有操作记录' : '创建或编辑卡片后，操作记录将在此显示'}
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={0} position="relative">
              {/* Vertical timeline line */}
              <Box
                position="absolute"
                left="15px"
                top="0"
                bottom="0"
                w="2px"
                bg="linear-gradient(180deg, rgba(167, 139, 250, 0.5) 0%, rgba(99, 102, 241, 0.2) 50%, rgba(167, 139, 250, 0.5) 100%)"
                borderRadius="full"
              />

              <AnimatePresence>
                {Array.from(groupedEvents.entries()).map(([dateLabel, dateEvents], groupIdx) => (
                  <Box key={dateLabel} mb={4}>
                    {/* Date group header */}
                    <MotionBox
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIdx * 0.08 }}
                      mb={3}
                      ml="0"
                    >
                      <HStack spacing={3}>
                        {/* Date dot on timeline */}
                        <Box
                          w="32px"
                          h="32px"
                          borderRadius="full"
                          bg="linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(167, 139, 250, 0.6))"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                          border="2px solid"
                          borderColor="whiteAlpha.200"
                          zIndex={1}
                        >
                          <Icon as={FaCalendarAlt} color="white" boxSize={3} />
                        </Box>
                        <Badge
                          bg="whiteAlpha.100"
                          color="whiteAlpha.800"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                          border="1px solid"
                          borderColor="whiteAlpha.150"
                        >
                          {dateLabel}
                        </Badge>
                      </HStack>
                    </MotionBox>

                    {/* Events in this date group */}
                    {dateEvents.map((event, eventIdx) => (
                      <TimelineEventNode
                        key={event.event_id}
                        event={event}
                        index={groupIdx * 10 + eventIdx}
                      />
                    ))}
                  </Box>
                ))}
              </AnimatePresence>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/** Single timeline event node */
function TimelineEventNode({ event, index }: { event: TimelineEvent; index: number }) {
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.card_created;

  return (
    <MotionBox
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.25 }}
      mb={2}
      position="relative"
      pl="44px"
    >
      {/* Dot on timeline */}
      <Box
        position="absolute"
        left="8px"
        top="12px"
        w="16px"
        h="16px"
        borderRadius="full"
        bg={config.dotBg}
        boxShadow={`0 0 10px ${config.color}40, 0 0 20px ${config.color}20`}
        zIndex={1}
        border="2px solid"
        borderColor="gray.800"
      />

      {/* Event card */}
      <Box
        p={3}
        borderRadius="14px"
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        _hover={{
          bg: 'whiteAlpha.100',
          borderColor: `${config.color}44`,
          boxShadow: `0 4px 20px ${config.color}15`,
        }}
        transition="all 0.2s ease"
        cursor="default"
      >
        <Flex justify="space-between" align="start" gap={2}>
          <HStack spacing={2} flex={1} align="start">
            <Box
              p={1.5}
              borderRadius="8px"
              bg={`${config.color}22`}
              color={config.color}
              flexShrink={0}
              mt="1px"
            >
              <Icon as={config.icon} boxSize={3} />
            </Box>
            <VStack align="start" spacing={0.5} flex={1}>
              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  bg={`${config.color}22`}
                  color={config.color}
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="10px"
                  fontWeight="bold"
                >
                  {config.label}
                </Badge>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {formatFullTime(event.event_time)}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                color="whiteAlpha.900"
                lineHeight="tall"
                wordBreak="break-word"
              >
                {event.description}
              </Text>
              {/* Details for title change */}
              {event.event_type === 'title_changed' && event.details && (
                <HStack spacing={2} mt={1} flexWrap="wrap">
                  <Text
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    bg="red.900"
                    color="red.200"
                    textDecoration="line-through"
                  >
                    {event.details.old_title}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.400">→</Text>
                  <Text
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    bg="green.900"
                    color="green.200"
                  >
                    {event.details.new_title}
                  </Text>
                </HStack>
              )}
              {/* Details for todo updates */}
              {event.event_type === 'todo_updated' && event.details?.changes && (
                <VStack align="start" spacing={0.5} mt={1}>
                  {event.details.changes.map((change, i) => (
                    <Text
                      key={i}
                      fontSize="xs"
                      color="whiteAlpha.600"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      bg="whiteAlpha.50"
                    >
                      {change}
                    </Text>
                  ))}
                </VStack>
              )}
            </VStack>
          </HStack>
        </Flex>
      </Box>
    </MotionBox>
  );
}
