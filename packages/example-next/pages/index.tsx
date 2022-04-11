import {Button, Stack} from "@chakra-ui/react";
import { ChakraProvider } from '@chakra-ui/react'
import Gslr from '../components/Nav'
import BasicStatistics from '../components/Stats'
import { AiFillFire } from "react-icons/ai";

export default function Home() {
  return (
    <>
      <ChakraProvider>
        <Gslr />
        <BasicStatistics />
        <br />
        <Stack direction='row' spacing={6} align="center" justify="center">
          <Button leftIcon={<AiFillFire />} colorScheme='teal' variant='solid'>
            Burn Tokens
          </Button>
        </Stack>
      </ChakraProvider>
    </>
  )
}
