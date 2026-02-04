import { useEffect } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Box,
  Spinner,
  Badge,
  chakra,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrashRestore } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';
import { IdeaCardItem } from './IdeaCardItem';

const MotionBox = chakra(motion.div);

export function DeletedCardsDrawer() {
  const {
    isDeletedViewOpen,
    setDeletedViewOpen,
    deletedCards,
    fetchDeletedCards,
    isLoading,
  } = useCardStore();

  // 打开时获取已删除卡片
  useEffect(() => {
    if (isDeletedViewOpen) {
      fetchDeletedCards();
    }
  }, [isDeletedViewOpen, fetchDeletedCards]);

  return (
    <Drawer
      isOpen={isDeletedViewOpen}
      onClose={() => setDeletedViewOpen(false)}
      placement="right"
      size="lg"
    >
      <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <DrawerContent
        borderLeftRadius="24px"
        bg="gray.50"
        boxShadow="-20px 0 60px rgba(0, 0, 0, 0.15)"
      >
        <DrawerHeader
          fontSize="xl"
          fontWeight="bold"
          color="gray.700"
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <HStack>
            <FaTrashRestore color="#718096" />
            <Text>已删除的卡片</Text>
            <Badge colorScheme="gray" fontSize="sm" borderRadius="full">
              {deletedCards.length}
            </Badge>
          </HStack>
        </DrawerHeader>
        <DrawerCloseButton borderRadius="full" />

        <DrawerBody py={4}>
          {isLoading ? (
            <VStack py={12}>
              <Spinner size="lg" color="blue.400" />
              <Text color="gray.500">加载中...</Text>
            </VStack>
          ) : deletedCards.length > 0 ? (
            <VStack spacing={4} align="stretch">
              <AnimatePresence>
                {deletedCards.map((card, index) => (
                  <MotionBox
                    key={card._id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IdeaCardItem card={card} isDeleted />
                  </MotionBox>
                ))}
              </AnimatePresence>
            </VStack>
          ) : (
            <VStack py={12} spacing={4}>
              <Text fontSize="5xl">🗑️</Text>
              <Text color="gray.500" fontWeight="medium">
                没有已删除的卡片
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                删除的卡片会出现在这里
                <br />
                可以随时恢复
              </Text>
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
