export type FocusEmulationSetter = (enabled: boolean) => Promise<void>

/**
Allows hidden browser targets to deliver scheduled frames for one bounded
operation, then restores native background scheduling without changing OS
focus. An operation failure remains authoritative if cleanup also fails.
*/
export async function withBackgroundFrameScheduling<T>(
  setFocusEmulation: FocusEmulationSetter,
  operation: () => Promise<T>,
): Promise<T> {
  await setFocusEmulation(true)
  let operationFailure: unknown = null
  try {
    return await operation()
  } catch (error) {
    operationFailure = error
    throw error
  } finally {
    try {
      await setFocusEmulation(false)
    } catch (cleanupError) {
      if (operationFailure === null) throw cleanupError
    }
  }
}
