import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';

export function DeleteConfirmModal() {
  const toast = useToast();
  const {
    deleteConfirmCardId,
    setDeleteConfirmCardId,
    softDeleteCard,
    cards,
    isLoading,
  } = useCardStore();

  const card = cards.find((c) => c._id === deleteConfirmCardId);

  const handleClose = () => {
    setDeleteConfirmCardId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCardId) return;

    try {
      await softDeleteCard(deleteConfirmCardId);
      toast({
        title: '删除成功',
        description: '卡片已移至已删除列表，可随时恢复',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: '删除失败',
        description: '请稍后重试',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal
      isOpen={!!deleteConfirmCardId}
      onClose={handleClose}
      isCentered
      motionPreset="scale"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="20px"
        bg="white"
        boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
        mx={4}
        maxW="400px"
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="bold"
          color="gray.700"
          textAlign="center"
          pb={0}
        >
          🗑️ 确认删除
        </ModalHeader>

        <ModalBody py={4}>
          <VStack spacing={3}>
            <Text color="gray.600" textAlign="center">
              确定要删除这张想法卡片吗？
            </Text>
            {card && (
              <Text
                fontWeight="bold"
                color="gray.700"
                bg="gray.50"
                px={4}
                py={2}
                borderRadius="12px"
                noOfLines={1}
              >
                「{card.title}」
              </Text>
            )}
            <Text fontSize="sm" color="gray.500" textAlign="center">
              删除后可在已删除列表中恢复
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center" pt={2}>
          <Button
            leftIcon={<FaTimes />}
            variant="ghost"
            onClick={handleClose}
            borderRadius="12px"
            mr={3}
            color="gray.500"
          >
            取消
          </Button>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            onClick={handleConfirmDelete}
            isLoading={isLoading}
            borderRadius="12px"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            确认删除
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
