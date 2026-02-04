import { useEffect } from 'react';
import { Box, SimpleGrid, VStack, Text, Spinner, chakra } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../stores/cardStore';
import { IdeaCardItem } from './IdeaCardItem';

const MotionBox = chakra(motion.div);

export function CardGrid() {
  const { cards, fetchCards, isLoading, error } = useCardStore();

  // 初始加载卡片
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // 加载状态
  if (isLoading && cards.length === 0) {
    return (
      <VStack
        h="100%"
        justify="center"
        align="center"
        spacing={4}
        py={20}
      >
        <Spinner size="xl" color="purple.400" thickness="4px" />
        <Text color="gray.300" fontSize="lg">
          加载中...
        </Text>
      </VStack>
    );
  }

  // 错误状态
  if (error && cards.length === 0) {
    return (
      <VStack
        h="100%"
        justify="center"
        align="center"
        spacing={4}
        py={20}
      >
        <Text fontSize="5xl">😢</Text>
        <Text color="gray.300" fontSize="lg" fontWeight="medium">
          加载失败
        </Text>
        <Text color="gray.400" fontSize="sm">
          {error}
        </Text>
      </VStack>
    );
  }

  // 空状态
  if (cards.length === 0) {
    return (
      <VStack
        h="100%"
        justify="center"
        align="center"
        spacing={6}
        py={20}
      >
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Text fontSize="6xl">💡</Text>
        </MotionBox>
        <VStack spacing={2}>
          <Text color="gray.200" fontSize="xl" fontWeight="medium">
            还没有任何想法
          </Text>
          <Text color="gray.400" fontSize="md" textAlign="center">
            点击右下角的 + 按钮
            <br />
            记录你的第一个想法吧！
          </Text>
        </VStack>
      </VStack>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        spacing={{ base: 4, md: 6 }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <IdeaCardItem key={card._id} card={card} />
          ))}
        </AnimatePresence>
      </SimpleGrid>
    </Box>
  );
}
