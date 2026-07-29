import type { Abi } from "viem";
import {
  IdentityRegistryArtifact,
  SecurityTokenArtifact,
} from "@/lib/web3/artifacts";

export const identityRegistryAbi = IdentityRegistryArtifact.abi as Abi;
export const securityTokenAbi = SecurityTokenArtifact.abi as Abi;

export const identityRegistryBytecode =
  IdentityRegistryArtifact.bytecode as `0x${string}`;
export const securityTokenBytecode =
  SecurityTokenArtifact.bytecode as `0x${string}`;
