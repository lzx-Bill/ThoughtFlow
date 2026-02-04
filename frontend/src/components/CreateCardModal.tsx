import { useState } from 'react';
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
  FormControl,
  FormLabel,
  HStack,
  Box,
  Text,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlus, FaPalette } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';
import type { CardStyle, CreateCardRequest } from '../types';
import { PRESET_CARD_STYLES, DEFAULT_CARD_STYLE } from '../types';

const MotionBox = chakra(motion.div);

export function CreateCardModal() {
  const toast = useToast();
  const { isCreateModalOpen, setCreateModalOpen, createCard, isLoading } = useCardStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>(DEFAULT_CARD_STYLE);

  const handleClose = () => {
    setCreateModalOpen(false);
    setTitle('');
    setContent('');
    setSelectedStyle(DEFAULT_CARD_STYLE);
  };

  const handleCreate = async () => {
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

    const cardData: CreateCardRequest = {
      title: title.trim(),
      content: content.trim(),
      card_style: selectedStyle,
    };

    try {
      await createCard(cardData);
      toast({
        title: '创建成功',
        description: '新的想法卡片已添加',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      handleClose();
    } catch {
      toast({
        title: '创建失败',
        description: '请稍后重试',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      isCentered
      motionPreset="slideInBottom"
      size="lg"
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="24px"
        bg="white"
        boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
        mx={4}
      >
        <ModalHeader
          fontSize="xl"
          fontWeight="bold"
          color="gray.700"
          pb={2}
        >
          ✨ 记录新想法
        </ModalHeader>
        <ModalCloseButton borderRadius="full" />

        <ModalBody>
          <VStack spacing={4}>
            {/* 预览卡片 */}
            <MotionBox
              w="100%"
              p={4}
              borderRadius={selectedStyle.border_radius}
              bg={selectedStyle.bg_color}
              color={selectedStyle.text_color}
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              minH="80px"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Text fontWeight="bold" fontSize="md" mb={1}>
                {title || '想法标题'}
              </Text>
              <Text fontSize="sm" opacity={0.8}>
                {content || '想法内容...'}
              </Text>
            </MotionBox>

            {/* 标题输入 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                想法标题
              </FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="一句话描述你的想法..."
                borderRadius="12px"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                maxLength={100}
              />
            </FormControl>

            {/* 内容输入 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                详细内容
              </FormLabel>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="详细记录你的想法、计划或灵感..."
                borderRadius="12px"
                borderColor="gray.200"
                minH="120px"
                resize="vertical"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4299E1' }}
                maxLength={2000}
              />
            </FormControl>

            {/* 颜色选择 */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.600">
                <HStack>
                  <FaPalette />
                  <Text>选择颜色</Text>
                </HStack>
              </FormLabel>
              <HStack spacing={2} wrap="wrap">
                {PRESET_CARD_STYLES.map((style, index) => (
                  <MotionBox
                    key={index}
                    w="36px"
                    h="36px"
                    borderRadius="12px"
                    bg={style.bg_color}
                    cursor="pointer"
                    onClick={() => setSelectedStyle(style)}
                    border={
                      selectedStyle.bg_color === style.bg_color
                        ? '3px solid #4299E1'
                        : '3px solid transparent'
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                  />
                ))}
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
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={handleCreate}
              isLoading={isLoading}
              borderRadius="12px"
              px={6}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              创建卡片
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
