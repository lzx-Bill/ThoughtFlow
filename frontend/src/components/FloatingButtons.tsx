import { Box, IconButton, Tooltip, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaPlus, FaTrashRestore } from 'react-icons/fa';
import { useCardStore } from '../stores/cardStore';

const MotionBox = chakra(motion.div);

export function FloatingButtons() {
  const { setCreateModalOpen, setDeletedViewOpen, deletedCards } = useCardStore();

  return (
    <>
      {/* 新建卡片按钮 - 右下角 */}
      <MotionBox
        position="fixed"
        bottom={8}
        right={8}
        zIndex={100}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <Tooltip label="记录新想法" placement="left" hasArrow>
          <IconButton
            aria-label="新建卡片"
            icon={<FaPlus size={24} />}
            onClick={() => setCreateModalOpen(true)}
            size="lg"
            w="64px"
            h="64px"
            borderRadius="full"
            bg="linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)"
            color="white"
            boxShadow="0 8px 30px rgba(167, 139, 250, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)"
            _hover={{
              transform: 'translateY(-4px) scale(1.05)',
              boxShadow: '0 12px 40px rgba(167, 139, 250, 0.6), 0 0 80px rgba(236, 72, 153, 0.4)',
            }}
            _active={{
              transform: 'translateY(-2px) scale(0.98)',
            }}
            transition="all 0.2s ease"
          />
        </Tooltip>
      </MotionBox>

      {/* 已删除卡片按钮 - 右下角上方 */}
      <MotionBox
        position="fixed"
        bottom={8}
        right={24 + 64 + 16}
        zIndex={100}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Tooltip label="已删除的卡片" placement="left" hasArrow>
          <Box position="relative">
            <IconButton
              aria-label="已删除卡片"
              icon={<FaTrashRestore size={18} />}
              onClick={() => setDeletedViewOpen(true)}
              size="md"
              w="48px"
              h="48px"
              borderRadius="full"
              bg="rgba(51, 65, 85, 0.8)"
              color="cyan.300"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="cyan.500"
              boxShadow="0 4px 20px rgba(34, 211, 238, 0.3)"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(34, 211, 238, 0.4)',
                bg: 'rgba(51, 65, 85, 0.9)',
                borderColor: 'cyan.400',
              }}
              _active={{
                transform: 'translateY(-1px) scale(0.98)',
              }}
              transition="all 0.2s ease"
            />
            {/* 数量徽章 */}
            {deletedCards.length > 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="-2px"
                bg="red.400"
                color="white"
                fontSize="xs"
                fontWeight="bold"
                borderRadius="full"
                minW="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={1}
              >
                {deletedCards.length}
              </Box>
            )}
          </Box>
        </Tooltip>
      </MotionBox>
    </>
  );
}
