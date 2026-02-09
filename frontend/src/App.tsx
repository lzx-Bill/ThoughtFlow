import { Box } from '@chakra-ui/react';
import {
  CardGrid,
  CreateCardModal,
  EditCardModal,
  DeleteConfirmModal,
  HistoryModal,
  DeletedCardsDrawer,
  FloatingButtons,
  GlobalTimelineModal,
} from './components';
import { useCardStore } from './stores/cardStore';

function App() {
  const { editModalCard, isEditModalOpen, setEditModalOpen } = useCardStore();

  return (
    <Box
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg="linear-gradient(135deg, #0f172a, #1e1b4b, #1e293b, #312e81)"
      backgroundSize="400% 400%"
      sx={{
        '@keyframes gradientAnimation': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        animation: 'gradientAnimation 15s ease infinite',
      }}
    >
      {/* 动态装饰性光晕 1 - 蓝紫色 */}
      <Box
        position="absolute"
        top="-100px"
        right="-100px"
        w="600px"
        h="600px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)"
        filter="blur(80px)"
        pointerEvents="none"
        sx={{
          '@keyframes floatAnimation1': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          },
          animation: 'floatAnimation1 20s ease-in-out infinite',
        }}
      />

      {/* 动态装饰性光晕 2 - 青色 */}
      <Box
        position="absolute"
        bottom="-150px"
        left="-150px"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 70%)"
        filter="blur(70px)"
        pointerEvents="none"
        sx={{
          '@keyframes floatAnimation2': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(-40px, 30px) scale(1.15)' },
            '66%': { transform: 'translate(25px, -25px) scale(0.85)' },
          },
          animation: 'floatAnimation2 25s ease-in-out infinite',
        }}
      />

      {/* 动态装饰性光晕 3 - 品红色 */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.12) 50%, transparent 70%)"
        filter="blur(90px)"
        pointerEvents="none"
        transform="translate(-50%, -50%)"
        sx={{
          '@keyframes floatAnimation3': {
            '0%, 100%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
            '50%': { transform: 'translate(-30%, -30%) rotate(180deg) scale(1.2)' },
          },
          animation: 'floatAnimation3 30s ease-in-out infinite',
        }}
      />

      {/* 额外的小光点装饰 */}
      <Box
        position="absolute"
        top="20%"
        left="15%"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)"
        filter="blur(50px)"
        pointerEvents="none"
        sx={{
          '@keyframes floatAnimation4': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
            '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          },
          animation: 'floatAnimation4 18s ease-in-out infinite 2s',
        }}
      />

      <Box
        position="absolute"
        bottom="25%"
        right="20%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, transparent 70%)"
        filter="blur(60px)"
        pointerEvents="none"
        sx={{
          '@keyframes floatAnimation5': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '33%': { transform: 'translate(-40px, 30px) scale(1.15)' },
            '66%': { transform: 'translate(25px, -25px) scale(0.85)' },
          },
          animation: 'floatAnimation5 22s ease-in-out infinite 4s',
        }}
      />

      {/* 网格纹理叠加层 */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.03"
        pointerEvents="none"
        bgImage="repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 40px)"
      />

      {/* 主内容区域 */}
      <Box
        position="relative"
        zIndex={1}
        minH="100vh"
        pb="100px"
      >
        {/* 页面标题 */}
        <Box
          textAlign="center"
          pt={{ base: 6, md: 10 }}
          pb={{ base: 2, md: 4 }}
        >
          <Box
            as="h1"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, #a78bfa, #ec4899, #38bdf8)"
            bgClip="text"
            letterSpacing="tight"
            textShadow="0 0 30px rgba(167, 139, 250, 0.3)"
          >
            💭 ThoughtFlow
          </Box>
          <Box
            fontSize={{ base: 'sm', md: 'md' }}
            color="gray.400"
            mt={1}
          >
            记录灵感，追溯想法
          </Box>
        </Box>

        {/* 卡片网格 */}
        <CardGrid />
      </Box>

      {/* 悬浮按钮 */}
      <FloatingButtons />

      {/* 弹窗和抽屉 */}
      <CreateCardModal />
      <EditCardModal
        card={editModalCard}
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
      <DeleteConfirmModal />
      <HistoryModal />
      <DeletedCardsDrawer />
      <GlobalTimelineModal />
    </Box>
  );
}

export default App;
